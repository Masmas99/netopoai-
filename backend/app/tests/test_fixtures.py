import pytest
from app.models.topology import (
    Topology, DeviceConfig, InterfaceConfig, Connection, SubnetPlan, StaticRoute
)
from app.core.catalog import DeviceType, InterfaceType, MediumType
from app.engine.validator import TopologyValidator
from app.engine.config_generator import CiscoConfigGenerator
from app.engine.ip_addressing import calculate_vlsm


def build_two_router_static_lab() -> Topology:
    """
    Standard Lab:
    PC1 (192.168.1.10/24) --- SW1 --- (Gig0/0 192.168.1.1) R1 (Ser0/0/0 10.0.0.1/30)
                                                                 |
                                                          (Serial WAN 10.0.0.0/30)
                                                                 |
    PC2 (192.168.2.10/24) --- SW2 --- (Gig0/0 192.168.2.1) R2 (Ser0/0/0 10.0.0.2/30)
    """
    pc1 = DeviceConfig(
        id="PC1", hostname="PC1", device_type=DeviceType.PC, model="Standard PC",
        default_gateway="192.168.1.1",
        interfaces=[InterfaceConfig(id="pc1_f0", name="FastEthernet0", device_id="PC1", interface_type=InterfaceType.FAST_ETHERNET, ip_address="192.168.1.10", subnet_mask="255.255.255.0")]
    )
    sw1 = DeviceConfig(
        id="SW1", hostname="SW1", device_type=DeviceType.SWITCH, model="Cisco 2960-24TT",
        interfaces=[
            InterfaceConfig(id="sw1_f1", name="FastEthernet0/1", device_id="SW1", interface_type=InterfaceType.FAST_ETHERNET),
            InterfaceConfig(id="sw1_g1", name="GigabitEthernet0/1", device_id="SW1", interface_type=InterfaceType.GIGABIT_ETHERNET),
        ]
    )
    r1 = DeviceConfig(
        id="R1", hostname="R1", device_type=DeviceType.ROUTER, model="Cisco 1941",
        interfaces=[
            InterfaceConfig(id="r1_g0", name="GigabitEthernet0/0", device_id="R1", interface_type=InterfaceType.GIGABIT_ETHERNET, ip_address="192.168.1.1", subnet_mask="255.255.255.0"),
            InterfaceConfig(id="r1_s0", name="Serial0/0/0", device_id="R1", interface_type=InterfaceType.SERIAL, ip_address="10.0.0.1", subnet_mask="255.255.255.252", clock_rate=64000),
        ],
        static_routes=[
            StaticRoute(destination_network="192.168.2.0", subnet_mask="255.255.255.0", next_hop="10.0.0.2")
        ]
    )

    pc2 = DeviceConfig(
        id="PC2", hostname="PC2", device_type=DeviceType.PC, model="Standard PC",
        default_gateway="192.168.2.1",
        interfaces=[InterfaceConfig(id="pc2_f0", name="FastEthernet0", device_id="PC2", interface_type=InterfaceType.FAST_ETHERNET, ip_address="192.168.2.10", subnet_mask="255.255.255.0")]
    )
    sw2 = DeviceConfig(
        id="SW2", hostname="SW2", device_type=DeviceType.SWITCH, model="Cisco 2960-24TT",
        interfaces=[
            InterfaceConfig(id="sw2_f1", name="FastEthernet0/1", device_id="SW2", interface_type=InterfaceType.FAST_ETHERNET),
            InterfaceConfig(id="sw2_g1", name="GigabitEthernet0/1", device_id="SW2", interface_type=InterfaceType.GIGABIT_ETHERNET),
        ]
    )
    r2 = DeviceConfig(
        id="R2", hostname="R2", device_type=DeviceType.ROUTER, model="Cisco 1941",
        interfaces=[
            InterfaceConfig(id="r2_g0", name="GigabitEthernet0/0", device_id="R2", interface_type=InterfaceType.GIGABIT_ETHERNET, ip_address="192.168.2.1", subnet_mask="255.255.255.0"),
            InterfaceConfig(id="r2_s0", name="Serial0/0/0", device_id="R2", interface_type=InterfaceType.SERIAL, ip_address="10.0.0.2", subnet_mask="255.255.255.252"),
        ],
        static_routes=[
            StaticRoute(destination_network="192.168.1.0", subnet_mask="255.255.255.0", next_hop="10.0.0.1")
        ]
    )

    connections = [
        Connection(id="c1", source_device_id="PC1", source_interface="FastEthernet0", target_device_id="SW1", target_interface="FastEthernet0/1", medium=MediumType.COPPER_STRAIGHT),
        Connection(id="c2", source_device_id="SW1", source_interface="GigabitEthernet0/1", target_device_id="R1", target_interface="GigabitEthernet0/0", medium=MediumType.COPPER_STRAIGHT),
        Connection(id="c3", source_device_id="R1", source_interface="Serial0/0/0", target_device_id="R2", target_interface="Serial0/0/0", medium=MediumType.SERIAL),
        Connection(id="c4", source_device_id="R2", source_interface="GigabitEthernet0/0", target_device_id="SW2", target_interface="GigabitEthernet0/1", medium=MediumType.COPPER_STRAIGHT),
        Connection(id="c5", source_device_id="SW2", source_interface="FastEthernet0/1", target_device_id="PC2", target_interface="FastEthernet0", medium=MediumType.COPPER_STRAIGHT),
    ]

    subnets = [
        SubnetPlan(id="s1", name="LAN-1", network_address="192.168.1.0", prefix_length=24, subnet_mask="255.255.255.0", broadcast_address="192.168.1.255", usable_host_start="192.168.1.1", usable_host_end="192.168.1.254", total_usable_hosts=254, gateway_ip="192.168.1.1"),
        SubnetPlan(id="s2", name="WAN-1", network_address="10.0.0.0", prefix_length=30, subnet_mask="255.255.255.252", broadcast_address="10.0.0.3", usable_host_start="10.0.0.1", usable_host_end="10.0.0.2", total_usable_hosts=2),
        SubnetPlan(id="s3", name="LAN-2", network_address="192.168.2.0", prefix_length=24, subnet_mask="255.255.255.0", broadcast_address="192.168.2.255", usable_host_start="192.168.2.1", usable_host_end="192.168.2.254", total_usable_hosts=254, gateway_ip="192.168.2.1"),
    ]

    return Topology(
        name="2-Router Static Routing Lab",
        devices=[pc1, sw1, r1, pc2, sw2, r2],
        connections=connections,
        subnets=subnets,
    )


def test_two_router_static_lab_validation_and_config():
    topo = build_two_router_static_lab()
    validator = TopologyValidator(topo)
    report = validator.validate()

    assert report.is_valid is True
    assert len(report.errors) == 0

    generator = CiscoConfigGenerator(topo)
    configs = generator.generate_all_configs()

    assert "R1" in configs
    assert "R2" in configs
    assert "SW1" in configs
    assert "PC1" in configs

    r1_cfg = configs["R1"]
    assert "ip address 192.168.1.1 255.255.255.0" in r1_cfg
    assert "ip address 10.0.0.1 255.255.255.252" in r1_cfg
    assert "ip route 192.168.2.0 255.255.255.0 10.0.0.2" in r1_cfg

    r2_cfg = configs["R2"]
    assert "ip address 192.168.2.1 255.255.255.0" in r2_cfg
    assert "ip address 10.0.0.2 255.255.255.252" in r2_cfg
    assert "ip route 192.168.1.0 255.255.255.0 10.0.0.1" in r2_cfg

