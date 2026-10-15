"""
Deterministic Topology Validation Engine for NetTopo AI.
Verifies topology graphs, interface constraints, physical link compatibility,
IP subnet alignment, gateway validity, and static route reachability.
"""

import ipaddress
import networkx as nx
from typing import List, Dict, Set, Tuple
from app.models.topology import (
    Topology, DeviceConfig, Connection, ValidationReport,
    ValidationIssue, ValidationSeverity
)
from app.core.catalog import DeviceType, InterfaceType, MediumType, get_device_profile
from app.engine.ip_addressing import check_subnet_overlaps, check_duplicate_ips


class TopologyValidator:
    def __init__(self, topology: Topology):
        self.topology = topology
        self.device_map: Dict[str, DeviceConfig] = {d.id: d for d in topology.devices}
        self.errors: List[ValidationIssue] = []
        self.warnings: List[ValidationIssue] = []
        self.info: List[ValidationIssue] = []

    def validate(self) -> ValidationReport:
        self.errors.clear()
        self.warnings.clear()
        self.info.clear()

        self._validate_devices()
        self._validate_connections()
        self._validate_ip_addressing()
        self._validate_graph_topology()
        self._validate_static_routes()

        is_valid = len(self.errors) == 0

        return ValidationReport(
            is_valid=is_valid,
            errors=self.errors,
            warnings=self.warnings,
            info=self.info,
        )

    def _add_issue(self, issue: ValidationIssue):
        if issue.severity == ValidationSeverity.ERROR:
            self.errors.append(issue)
        elif issue.severity == ValidationSeverity.WARNING:
            self.warnings.append(issue)
        else:
            self.info.append(issue)

    def _validate_devices(self):
        seen_hostnames: Set[str] = set()

        for dev in self.topology.devices:
            # Check duplicate hostname
            hname_lower = dev.hostname.strip().lower()
            if hname_lower in seen_hostnames:
                self._add_issue(ValidationIssue(
                    code="DUPLICATE_HOSTNAME",
                    message=f"Duplicate hostname '{dev.hostname}' detected.",
                    severity=ValidationSeverity.ERROR,
                    target_type="device",
                    target_id=dev.id,
                    suggestion="Ensure each device has a unique hostname.",
                ))
            else:
                seen_hostnames.add(hname_lower)

            # Check interface definitions
            seen_ifaces: Set[str] = set()
            for iface in dev.interfaces:
                iname_lower = iface.name.strip().lower()
                if iname_lower in seen_ifaces:
                    self._add_issue(ValidationIssue(
                        code="DUPLICATE_INTERFACE",
                        message=f"Device '{dev.hostname}' has duplicate interface name '{iface.name}'.",
                        severity=ValidationSeverity.ERROR,
                        target_type="device",
                        target_id=dev.id,
                    ))
                seen_ifaces.add(iname_lower)

    def _validate_connections(self):
        used_interfaces: Dict[Tuple[str, str], str] = {}  # (dev_id, iface_name) -> conn_id

        for conn in self.topology.connections:
            src_dev = self.device_map.get(conn.source_device_id)
            tgt_dev = self.device_map.get(conn.target_device_id)

            if not src_dev:
                self._add_issue(ValidationIssue(
                    code="UNKNOWN_SOURCE_DEVICE",
                    message=f"Connection {conn.id} references non-existent source device '{conn.source_device_id}'.",
                    severity=ValidationSeverity.ERROR,
                    target_type="connection",
                    target_id=conn.id,
                ))
                continue

            if not tgt_dev:
                self._add_issue(ValidationIssue(
                    code="UNKNOWN_TARGET_DEVICE",
                    message=f"Connection {conn.id} references non-existent target device '{conn.target_device_id}'.",
                    severity=ValidationSeverity.ERROR,
                    target_type="connection",
                    target_id=conn.id,
                ))
                continue

            if src_dev.id == tgt_dev.id:
                self._add_issue(ValidationIssue(
                    code="SELF_LOOP_CONNECTION",
                    message=f"Connection {conn.id} connects device '{src_dev.hostname}' to itself.",
                    severity=ValidationSeverity.WARNING,
                    target_type="connection",
                    target_id=conn.id,
                ))

            src_iface = src_dev.get_interface(conn.source_interface)
            tgt_iface = tgt_dev.get_interface(conn.target_interface)

            if not src_iface:
                self._add_issue(ValidationIssue(
                    code="UNKNOWN_SOURCE_INTERFACE",
                    message=f"Device '{src_dev.hostname}' does not have interface '{conn.source_interface}'.",
                    severity=ValidationSeverity.ERROR,
                    target_type="connection",
                    target_id=conn.id,
                ))
                continue

            if not tgt_iface:
                self._add_issue(ValidationIssue(
                    code="UNKNOWN_TARGET_INTERFACE",
                    message=f"Device '{tgt_dev.hostname}' does not have interface '{conn.target_interface}'.",
                    severity=ValidationSeverity.ERROR,
                    target_type="connection",
                    target_id=conn.id,
                ))
                continue

            # Check interface already connected
            src_key = (src_dev.id, src_iface.name.lower())
            tgt_key = (tgt_dev.id, tgt_iface.name.lower())

            if src_key in used_interfaces:
                self._add_issue(ValidationIssue(
                    code="PORT_ALREADY_CONNECTED",
                    message=f"Port '{src_dev.hostname}:{src_iface.name}' is already connected in connection '{used_interfaces[src_key]}'.",
                    severity=ValidationSeverity.ERROR,
                    target_type="connection",
                    target_id=conn.id,
                ))
            else:
                used_interfaces[src_key] = conn.id

            if tgt_key in used_interfaces:
                self._add_issue(ValidationIssue(
                    code="PORT_ALREADY_CONNECTED",
                    message=f"Port '{tgt_dev.hostname}:{tgt_iface.name}' is already connected in connection '{used_interfaces[tgt_key]}'.",
                    severity=ValidationSeverity.ERROR,
                    target_type="connection",
                    target_id=conn.id,
                ))
            else:
                used_interfaces[tgt_key] = conn.id

            # Validate physical media compatibility
            self._validate_media_compatibility(conn, src_dev, src_iface, tgt_dev, tgt_iface)

            # Validate connected interface subnets (if both have IPs)
            if src_iface.ip_address and tgt_iface.ip_address:
                self._validate_link_subnet(conn, src_dev, src_iface, tgt_dev, tgt_iface)

    def _validate_media_compatibility(self, conn, src_dev, src_iface, tgt_dev, tgt_iface):
        src_is_serial = src_iface.interface_type == InterfaceType.SERIAL
        tgt_is_serial = tgt_iface.interface_type == InterfaceType.SERIAL

        if src_is_serial != tgt_is_serial:
            self._add_issue(ValidationIssue(
                code="INCOMPATIBLE_PORT_TYPES",
                message=(
                    f"Incompatible interface types: '{src_dev.hostname}:{src_iface.name}' ({src_iface.interface_type}) "
                    f"cannot connect to '{tgt_dev.hostname}:{tgt_iface.name}' ({tgt_iface.interface_type})."
                ),
                severity=ValidationSeverity.ERROR,
                target_type="connection",
                target_id=conn.id,
            ))
            return

        if src_is_serial and tgt_is_serial and conn.medium != MediumType.SERIAL:
            self._add_issue(ValidationIssue(
                code="INVALID_CABLE_TYPE",
                message=f"Serial link between '{src_dev.hostname}' and '{tgt_dev.hostname}' must use serial cable.",
                severity=ValidationSeverity.WARNING,
                target_type="connection",
                target_id=conn.id,
                suggestion="Change cable medium to 'serial'.",
            ))

    def _validate_link_subnet(self, conn, src_dev, src_iface, tgt_dev, tgt_iface):
        try:
            src_mask = src_iface.subnet_mask or "255.255.255.0"
            tgt_mask = tgt_iface.subnet_mask or "255.255.255.0"

            src_net = ipaddress.IPv4Interface(f"{src_iface.ip_address}/{src_mask}").network
            tgt_net = ipaddress.IPv4Interface(f"{tgt_iface.ip_address}/{tgt_mask}").network

            if src_net != tgt_net:
                self._add_issue(ValidationIssue(
                    code="LINK_SUBNET_MISMATCH",
                    message=(
                        f"Direct link between {src_dev.hostname}:{src_iface.name} ({src_net}) "
                        f"and {tgt_dev.hostname}:{tgt_iface.name} ({tgt_net}) belong to different subnets!"
                    ),
                    severity=ValidationSeverity.ERROR,
                    target_type="connection",
                    target_id=conn.id,
                    suggestion="Assign IP addresses from the same subnet to directly connected interfaces.",
                ))
        except ValueError as e:
            self._add_issue(ValidationIssue(
                code="INVALID_INTERFACE_IP",
                message=f"Invalid IP address or subnet mask on connection {conn.id}: {e}",
                severity=ValidationSeverity.ERROR,
                target_type="connection",
                target_id=conn.id,
            ))

    def _validate_ip_addressing(self):
        # 1. Overlapping subnets
        overlap_issues = check_subnet_overlaps(self.topology.subnets)
        for issue in overlap_issues:
            self._add_issue(issue)

        # 2. Duplicate IPs
        dup_issues = check_duplicate_ips(self.topology.devices)
        for issue in dup_issues:
            self._add_issue(issue)

        # 3. Default gateway checks on End Devices (PCs, Laptops, Servers)
        for dev in self.topology.devices:
            if dev.device_type in (DeviceType.PC, DeviceType.LAPTOP, DeviceType.SERVER):
                if not dev.default_gateway:
                    self._add_issue(ValidationIssue(
                        code="MISSING_DEFAULT_GATEWAY",
                        message=f"Host '{dev.hostname}' has no default gateway configured.",
                        severity=ValidationSeverity.WARNING,
                        target_type="device",
                        target_id=dev.id,
                        suggestion="Configure default gateway IP so the host can communicate outside its local subnet.",
                    ))
                else:
                    self._validate_gateway_reachability(dev)

    def _validate_gateway_reachability(self, host: DeviceConfig):
        gw_ip = host.default_gateway.strip()
        # Find if gateway IP matches any router/L3 switch interface in the topology
        gateway_found = False
        matching_subnets: List[str] = []

        for dev in self.topology.devices:
            if dev.device_type in (DeviceType.ROUTER, DeviceType.LAYER3_SWITCH):
                for iface in dev.interfaces:
                    if iface.ip_address and iface.ip_address.strip() == gw_ip:
                        gateway_found = True
                        break
            if gateway_found:
                break

        if not gateway_found:
            self._add_issue(ValidationIssue(
                code="UNREACHABLE_GATEWAY_IP",
                message=f"Host '{host.hostname}' gateway '{gw_ip}' does not match any router or L3 switch interface IP.",
                severity=ValidationSeverity.WARNING,
                target_type="device",
                target_id=host.id,
                suggestion="Ensure the default gateway IP matches the local router's LAN interface IP.",
            ))

    def _validate_graph_topology(self):
        g = nx.Graph()
        for dev in self.topology.devices:
            g.add_node(dev.id)

        for conn in self.topology.connections:
            if conn.source_device_id in self.device_map and conn.target_device_id in self.device_map:
                g.add_edge(conn.source_device_id, conn.target_device_id)

        # Check for isolated devices (degree 0)
        for dev in self.topology.devices:
            if g.degree(dev.id) == 0:
                self._add_issue(ValidationIssue(
                    code="ISOLATED_DEVICE",
                    message=f"Device '{dev.hostname}' has no connections (isolated node).",
                    severity=ValidationSeverity.WARNING,
                    target_type="device",
                    target_id=dev.id,
                    suggestion="Connect this device to the appropriate switch or router.",
                ))

        # Informational: count connected components
        components = list(nx.connected_components(g))
        if len(components) > 1 and len(self.topology.devices) > 1:
            self._add_issue(ValidationIssue(
                code="DISCONNECTED_ISLANDS",
                message=f"Topology contains {len(components)} disconnected network segments.",
                severity=ValidationSeverity.INFO,
                target_type="global",
                suggestion="Verify whether multiple independent networks are intentional.",
            ))

    def _validate_static_routes(self):
        for dev in self.topology.devices:
            if not dev.static_routes:
                continue

            for route in dev.static_routes:
                try:
                    dest_net = ipaddress.IPv4Network(f"{route.destination_network}/{route.subnet_mask}", strict=False)
                except ValueError as e:
                    self._add_issue(ValidationIssue(
                        code="INVALID_STATIC_ROUTE_DEST",
                        message=f"Device '{dev.hostname}' has invalid static route destination {route.destination_network}: {e}",
                        severity=ValidationSeverity.ERROR,
                        target_type="device",
                        target_id=dev.id,
                    ))
                    continue

                # If exit interface specified, verify it exists on dev
                if route.exit_interface:
                    iface = dev.get_interface(route.exit_interface)
                    if not iface:
                        self._add_issue(ValidationIssue(
                            code="INVALID_STATIC_ROUTE_INTERFACE",
                            message=f"Static route on '{dev.hostname}' specifies non-existent exit interface '{route.exit_interface}'.",
                            severity=ValidationSeverity.ERROR,
                            target_type="device",
                            target_id=dev.id,
                        ))

