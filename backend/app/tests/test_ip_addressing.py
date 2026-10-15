import pytest
from app.engine.ip_addressing import (
    calculate_subnet_details,
    calculate_vlsm,
    check_subnet_overlaps,
    check_duplicate_ips,
    IPAddressingError,
)
from app.models.topology import SubnetPlan, DeviceConfig, InterfaceConfig
from app.core.catalog import DeviceType, InterfaceType


def test_calculate_subnet_details_standard():
    details = calculate_subnet_details("192.168.1.0/24")
    assert details["network_address"] == "192.168.1.0"
    assert details["prefix_length"] == 24
    assert details["subnet_mask"] == "255.255.255.0"
    assert details["broadcast_address"] == "192.168.1.255"
    assert details["usable_host_start"] == "192.168.1.1"
    assert details["usable_host_end"] == "192.168.1.254"
    assert details["total_usable_hosts"] == 254
    assert details["gateway_ip"] == "192.168.1.1"


def test_calculate_subnet_details_point_to_point():
    details = calculate_subnet_details("10.0.0.0/30")
    assert details["network_address"] == "10.0.0.0"
    assert details["prefix_length"] == 30
    assert details["subnet_mask"] == "255.255.255.252"
    assert details["broadcast_address"] == "10.0.0.3"
    assert details["usable_host_start"] == "10.0.0.1"
    assert details["usable_host_end"] == "10.0.0.2"
    assert details["total_usable_hosts"] == 2


def test_calculate_vlsm_success():
    reqs = [
        {"name": "LAN-Sales", "required_hosts": 100},
        {"name": "LAN-Eng", "required_hosts": 50},
        {"name": "WAN-Link", "required_hosts": 2},
    ]
    subnets = calculate_vlsm("192.168.10.0/24", reqs)
    assert len(subnets) == 3

    # First should be LAN-Sales (100 hosts needs /25, block of 128)
    assert subnets[0].name == "LAN-Sales"
    assert subnets[0].network_address == "192.168.10.0"
    assert subnets[0].prefix_length == 25

    # Second should be LAN-Eng (50 hosts needs /26, block of 64)
    assert subnets[1].name == "LAN-Eng"
    assert subnets[1].network_address == "192.168.10.128"
    assert subnets[1].prefix_length == 26

    # Third should be WAN-Link (2 hosts needs /30, block of 4)
    assert subnets[2].name == "WAN-Link"
    assert subnets[2].network_address == "192.168.10.192"
    assert subnets[2].prefix_length == 30


def test_calculate_vlsm_exhausted():
    reqs = [
        {"name": "BigLAN1", "required_hosts": 200},
        {"name": "BigLAN2", "required_hosts": 200},
    ]
    with pytest.raises(IPAddressingError):
        calculate_vlsm("192.168.1.0/24", reqs)


def test_check_subnet_overlaps():
    sub1 = SubnetPlan(
        id="s1", name="S1", network_address="192.168.1.0", prefix_length=24,
        subnet_mask="255.255.255.0", broadcast_address="192.168.1.255",
        usable_host_start="192.168.1.1", usable_host_end="192.168.1.254",
        total_usable_hosts=254
    )
    sub2 = SubnetPlan(
        id="s2", name="S2", network_address="192.168.1.128", prefix_length=25,
        subnet_mask="255.255.255.128", broadcast_address="192.168.1.255",
        usable_host_start="192.168.1.129", usable_host_end="192.168.1.254",
        total_usable_hosts=126
    )
    issues = check_subnet_overlaps([sub1, sub2])
    assert len(issues) == 1
    assert issues[0].code == "SUBNET_OVERLAP"


def test_check_duplicate_ips():
    dev1 = DeviceConfig(
        id="R1", hostname="Router1", device_type=DeviceType.ROUTER, model="Cisco 1941",
        interfaces=[
            InterfaceConfig(id="i1", name="GigabitEthernet0/0", device_id="R1", interface_type=InterfaceType.GIGABIT_ETHERNET, ip_address="192.168.1.1", subnet_mask="255.255.255.0")
        ]
    )
    dev2 = DeviceConfig(
        id="PC1", hostname="PC1", device_type=DeviceType.PC, model="Standard PC",
        interfaces=[
            InterfaceConfig(id="i2", name="FastEthernet0", device_id="PC1", interface_type=InterfaceType.FAST_ETHERNET, ip_address="192.168.1.1", subnet_mask="255.255.255.0")
        ]
    )
    issues = check_duplicate_ips([dev1, dev2])
    assert len(issues) == 1
    assert issues[0].code == "DUPLICATE_IP"

