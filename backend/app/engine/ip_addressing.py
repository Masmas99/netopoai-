"""
Deterministic IP Addressing and VLSM Engine for NetTopo AI.
Uses Python's standard library `ipaddress` for 100% mathematically verified
subnetting, host range calculations, overlap detection, and duplicate checks.
"""

import ipaddress
import math
from typing import List, Dict, Tuple, Optional, Any
from app.models.topology import SubnetPlan, DeviceConfig, ValidationIssue, ValidationSeverity


class IPAddressingError(Exception):
    pass


class SubnetOverlapError(IPAddressingError):
    pass


class DuplicateIPError(IPAddressingError):
    pass


def calculate_subnet_details(network_str: str) -> Dict[str, Any]:
    """
    Given a network string like '192.168.1.0/24', computes network, broadcast,
    netmask, usable host range, and total usable host count.
    """
    try:
        net = ipaddress.IPv4Network(network_str, strict=False)
    except ValueError as e:
        raise IPAddressingError(f"Invalid network CIDR '{network_str}': {e}")

    num_hosts = net.num_addresses
    if net.prefixlen == 31:
        # RFC 3021: 31-bit prefixes for point-to-point
        start_ip = str(net.network_address)
        end_ip = str(net.broadcast_address)
        usable_hosts = 2
        gateway = start_ip
    elif net.prefixlen == 32:
        start_ip = str(net.network_address)
        end_ip = str(net.network_address)
        usable_hosts = 1
        gateway = start_ip
    else:
        start_ip = str(net.network_address + 1)
        end_ip = str(net.broadcast_address - 1)
        usable_hosts = max(0, num_hosts - 2)
        gateway = start_ip

    return {
        "network_address": str(net.network_address),
        "prefix_length": net.prefixlen,
        "subnet_mask": str(net.netmask),
        "broadcast_address": str(net.broadcast_address),
        "usable_host_start": start_ip,
        "usable_host_end": end_ip,
        "total_usable_hosts": usable_hosts,
        "gateway_ip": gateway,
    }


def calculate_vlsm(
    major_network: str,
    requirements: List[Dict[str, Any]]
) -> List[SubnetPlan]:
    """
    Performs Variable Length Subnet Masking (VLSM) on a major network.
    Requirements is a list of dicts: [{'name': 'LAN-A', 'required_hosts': 50}, ...]
    Sorted descending by required hosts for optimal non-overlapping allocation.
    """
    try:
        parent_net = ipaddress.IPv4Network(major_network, strict=True)
    except ValueError as e:
        raise IPAddressingError(f"Invalid major network '{major_network}': {e}")

    # Sort descending by required host count
    sorted_reqs = sorted(requirements, key=lambda r: r.get("required_hosts", 0), reverse=True)

    current_ip_int = int(parent_net.network_address)
    parent_end_int = int(parent_net.broadcast_address)

    subnets: List[SubnetPlan] = []

    for idx, req in enumerate(sorted_reqs):
        name = req.get("name", f"Subnet-{idx+1}")
        needed_hosts = req.get("required_hosts", 2)
        vlan_id = req.get("vlan_id")

        # Determine prefix needed: 2^(32 - prefix) - 2 >= needed_hosts
        if needed_hosts <= 2:
            prefix = 30  # Standard point-to-point
        else:
            host_bits = math.ceil(math.log2(needed_hosts + 2))
            prefix = 32 - host_bits

        if prefix < parent_net.prefixlen:
            raise IPAddressingError(
                f"Required hosts ({needed_hosts}) for '{name}' exceeds major network capacity ({parent_net})"
            )

        block_size = 2 ** (32 - prefix)

        # Align current_ip_int to block_size boundary
        if current_ip_int % block_size != 0:
            current_ip_int = ((current_ip_int // block_size) + 1) * block_size

        if current_ip_int + block_size - 1 > parent_end_int:
            raise IPAddressingError(
                f"Cannot allocate subnet '{name}' (needs /{prefix}): Major network '{major_network}' exhausted!"
            )

        allocated_net = ipaddress.IPv4Network((current_ip_int, prefix))
        details = calculate_subnet_details(str(allocated_net))

        plan = SubnetPlan(
            id=f"sub_{idx+1}",
            name=name,
            network_address=details["network_address"],
            prefix_length=details["prefix_length"],
            subnet_mask=details["subnet_mask"],
            broadcast_address=details["broadcast_address"],
            usable_host_start=details["usable_host_start"],
            usable_host_end=details["usable_host_end"],
            total_usable_hosts=details["total_usable_hosts"],
            required_hosts=needed_hosts,
            gateway_ip=details["gateway_ip"],
            vlan_id=vlan_id,
        )
        subnets.append(plan)
        current_ip_int += block_size

    return subnets


def check_subnet_overlaps(subnets: List[SubnetPlan]) -> List[ValidationIssue]:
    """
    Detects overlapping IP subnets among SubnetPlan objects.
    """
    issues: List[ValidationIssue] = []
    networks: List[Tuple[SubnetPlan, ipaddress.IPv4Network]] = []

    for sub in subnets:
        try:
            net = ipaddress.IPv4Network(f"{sub.network_address}/{sub.prefix_length}", strict=False)
            networks.append((sub, net))
        except ValueError as e:
            issues.append(ValidationIssue(
                code="INVALID_SUBNET",
                message=f"Subnet '{sub.name}' has invalid network CIDR: {e}",
                severity=ValidationSeverity.ERROR,
                target_type="subnet",
                target_id=sub.id,
            ))

    # Pairwise comparison
    for i in range(len(networks)):
        for j in range(i + 1, len(networks)):
            sub1, net1 = networks[i]
            sub2, net2 = networks[j]
            if net1.overlaps(net2):
                issues.append(ValidationIssue(
                    code="SUBNET_OVERLAP",
                    message=f"Subnet '{sub1.name}' ({net1}) overlaps with subnet '{sub2.name}' ({net2})",
                    severity=ValidationSeverity.ERROR,
                    target_type="subnet",
                    target_id=sub1.id,
                    suggestion="Recalculate VLSM or allocate distinct network spaces.",
                ))

    return issues


def check_duplicate_ips(devices: List[DeviceConfig]) -> List[ValidationIssue]:
    """
    Scans all device interfaces for duplicate IP addresses.
    """
    issues: List[ValidationIssue] = []
    seen_ips: Dict[str, Tuple[str, str]] = {}  # ip -> (device_id, iface_name)

    for dev in devices:
        for iface in dev.interfaces:
            if iface.ip_address:
                ip_clean = iface.ip_address.strip()
                if ip_clean in seen_ips:
                    prev_dev, prev_iface = seen_ips[ip_clean]
                    issues.append(ValidationIssue(
                        code="DUPLICATE_IP",
                        message=(
                            f"Duplicate IP {ip_clean} found on {dev.hostname} ({iface.name}) "
                            f"and {prev_dev} ({prev_iface})"
                        ),
                        severity=ValidationSeverity.ERROR,
                        target_type="device",
                        target_id=dev.id,
                        suggestion="Assign unique host IP addresses to each interface.",
                    ))
                else:
                    seen_ips[ip_clean] = (dev.hostname, iface.name)

    return issues

