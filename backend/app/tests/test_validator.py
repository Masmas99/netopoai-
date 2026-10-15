import pytest
from app.models.topology import (
    Topology, DeviceConfig, InterfaceConfig, Connection, SubnetPlan, StaticRoute
)
from app.core.catalog import DeviceType, InterfaceType, MediumType
from app.engine.validator import TopologyValidator


def test_validator_valid_topology():
    r1 = DeviceConfig(
        id="R1", hostname="Router1", device_type=DeviceType.ROUTER, model="Cisco 1941",
        interfaces=[
            InterfaceConfig(id="r1_g0", name="GigabitEthernet0/0", device_id="R1", interface_type=InterfaceType.GIGABIT_ETHERNET, ip_address="192.168.1.1", subnet_mask="255.255.255.0"),
            InterfaceConfig(id="r1_s0", name="Serial0/0/0", device_id="R1", interface_type=InterfaceType.SERIAL, ip_address="10.0.0.1", subnet_mask="255.255.255.252"),
        ],
        static_routes=[
            StaticRoute(destination_network="192.168.2.0", subnet_mask="255.255.255.0", next_hop="10.0.0.2")
        ]
    )
    r2 = DeviceConfig(
        id="R2", hostname="Router2", device_type=DeviceType.ROUTER, model="Cisco 1941",
        interfaces=[
            InterfaceConfig(id="r2_g0", name="GigabitEthernet0/0", device_id="R2", interface_type=InterfaceType.GIGABIT_ETHERNET, ip_address="192.168.2.1", subnet_mask="255.255.255.0"),
            InterfaceConfig(id="r2_s0", name="Serial0/0/0", device_id="R2", interface_type=InterfaceType.SERIAL, ip_address="10.0.0.2", subnet_mask="255.255.255.252"),
        ],
        static_routes=[
            StaticRoute(destination_network="192.168.1.0", subnet_mask="255.255.255.0", next_hop="10.0.0.1")
        ]
    )
    conn = Connection(
        id="c1",
        source_device_id="R1",
        source_interface="Serial0/0/0",
        target_device_id="R2",
        target_interface="Serial0/0/0",
        medium=MediumType.SERIAL,
    )
    top = Topology(name="Test Topo", devices=[r1, r2], connections=[conn])
    validator = TopologyValidator(top)
    report = validator.validate()

    assert report.is_valid is True
    assert len(report.errors) == 0


def test_validator_port_already_connected():
    r1 = DeviceConfig(
        id="R1", hostname="Router1", device_type=DeviceType.ROUTER, model="Cisco 1941",
        interfaces=[
            InterfaceConfig(id="r1_g0", name="GigabitEthernet0/0", device_id="R1", interface_type=InterfaceType.GIGABIT_ETHERNET),
        ]
    )
    sw1 = DeviceConfig(
        id="SW1", hostname="Switch1", device_type=DeviceType.SWITCH, model="Cisco 2960-24TT",
        interfaces=[
            InterfaceConfig(id="sw1_g1", name="GigabitEthernet0/1", device_id="SW1", interface_type=InterfaceType.GIGABIT_ETHERNET),
        ]
    )
    sw2 = DeviceConfig(
        id="SW2", hostname="Switch2", device_type=DeviceType.SWITCH, model="Cisco 2960-24TT",
        interfaces=[
            InterfaceConfig(id="sw2_g1", name="GigabitEthernet0/1", device_id="SW2", interface_type=InterfaceType.GIGABIT_ETHERNET),
        ]
    )
    # Both try to connect to R1's GigabitEthernet0/0
    c1 = Connection(id="c1", source_device_id="R1", source_interface="GigabitEthernet0/0", target_device_id="SW1", target_interface="GigabitEthernet0/1")
    c2 = Connection(id="c2", source_device_id="R1", source_interface="GigabitEthernet0/0", target_device_id="SW2", target_interface="GigabitEthernet0/1")

    top = Topology(name="Conflict Topo", devices=[r1, sw1, sw2], connections=[c1, c2])
    validator = TopologyValidator(top)
    report = validator.validate()

    assert report.is_valid is False
    codes = [e.code for e in report.errors]
    assert "PORT_ALREADY_CONNECTED" in codes


def test_validator_incompatible_port_types():
    r1 = DeviceConfig(
        id="R1", hostname="Router1", device_type=DeviceType.ROUTER, model="Cisco 1941",
        interfaces=[
            InterfaceConfig(id="r1_s0", name="Serial0/0/0", device_id="R1", interface_type=InterfaceType.SERIAL),
        ]
    )
    sw1 = DeviceConfig(
        id="SW1", hostname="Switch1", device_type=DeviceType.SWITCH, model="Cisco 2960-24TT",
        interfaces=[
            InterfaceConfig(id="sw1_g1", name="GigabitEthernet0/1", device_id="SW1", interface_type=InterfaceType.GIGABIT_ETHERNET),
        ]
    )
    # Connecting Serial to GigabitEthernet
    c1 = Connection(id="c1", source_device_id="R1", source_interface="Serial0/0/0", target_device_id="SW1", target_interface="GigabitEthernet0/1")

    top = Topology(name="Bad Media", devices=[r1, sw1], connections=[c1])
    validator = TopologyValidator(top)
    report = validator.validate()

    assert report.is_valid is False
    assert any(e.code == "INCOMPATIBLE_PORT_TYPES" for e in report.errors)


def test_validator_link_subnet_mismatch():
    r1 = DeviceConfig(
        id="R1", hostname="Router1", device_type=DeviceType.ROUTER, model="Cisco 1941",
        interfaces=[
            InterfaceConfig(id="r1_g0", name="GigabitEthernet0/0", device_id="R1", interface_type=InterfaceType.GIGABIT_ETHERNET, ip_address="192.168.1.1", subnet_mask="255.255.255.0"),
        ]
    )
    r2 = DeviceConfig(
        id="R2", hostname="Router2", device_type=DeviceType.ROUTER, model="Cisco 1941",
        interfaces=[
            InterfaceConfig(id="r2_g0", name="GigabitEthernet0/0", device_id="R2", interface_type=InterfaceType.GIGABIT_ETHERNET, ip_address="10.0.0.1", subnet_mask="255.255.255.0"),
        ]
    )
    c1 = Connection(id="c1", source_device_id="R1", source_interface="GigabitEthernet0/0", target_device_id="R2", target_interface="GigabitEthernet0/0")

    top = Topology(name="Subnet Mismatch", devices=[r1, r2], connections=[c1])
    validator = TopologyValidator(top)
    report = validator.validate()

    assert report.is_valid is False
    assert any(e.code == "LINK_SUBNET_MISMATCH" for e in report.errors)

