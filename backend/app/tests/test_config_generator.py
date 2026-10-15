from app.models.topology import (
    Topology, DeviceConfig, InterfaceConfig, StaticRoute
)
from app.core.catalog import DeviceType, InterfaceType
from app.engine.config_generator import CiscoConfigGenerator


def test_generate_router_config():
    r1 = DeviceConfig(
        id="R1", hostname="Router1", device_type=DeviceType.ROUTER, model="Cisco 1941",
        interfaces=[
            InterfaceConfig(id="r1_g0", name="GigabitEthernet0/0", device_id="R1", interface_type=InterfaceType.GIGABIT_ETHERNET, ip_address="192.168.1.1", subnet_mask="255.255.255.0"),
            InterfaceConfig(id="r1_s0", name="Serial0/0/0", device_id="R1", interface_type=InterfaceType.SERIAL, ip_address="10.0.0.1", subnet_mask="255.255.255.252", clock_rate=64000),
        ],
        static_routes=[
            StaticRoute(destination_network="192.168.2.0", subnet_mask="255.255.255.0", next_hop="10.0.0.2")
        ]
    )
    generator = CiscoConfigGenerator(Topology(devices=[r1]))
    cfg = generator.generate_device_config(r1)

    assert "hostname Router1" in cfg
    assert "interface GigabitEthernet0/0" in cfg
    assert "ip address 192.168.1.1 255.255.255.0" in cfg
    assert "interface Serial0/0/0" in cfg
    assert "clock rate 64000" in cfg
    assert "ip route 192.168.2.0 255.255.255.0 10.0.0.2" in cfg
    assert "no shutdown" in cfg


def test_generate_switch_config():
    sw1 = DeviceConfig(
        id="SW1", hostname="Switch-Floor1", device_type=DeviceType.SWITCH, model="Cisco 2960-24TT",
        default_gateway="192.168.1.1",
        interfaces=[
            InterfaceConfig(id="sw1_f1", name="FastEthernet0/1", device_id="SW1", interface_type=InterfaceType.FAST_ETHERNET, vlan_id=10),
            InterfaceConfig(id="sw1_g1", name="GigabitEthernet0/1", device_id="SW1", interface_type=InterfaceType.GIGABIT_ETHERNET, is_trunk=True),
        ]
    )
    generator = CiscoConfigGenerator(Topology(devices=[sw1]))
    cfg = generator.generate_device_config(sw1)

    assert "hostname Switch-Floor1" in cfg
    assert "vlan 10" in cfg
    assert "interface FastEthernet0/1" in cfg
    assert "switchport mode access" in cfg
    assert "switchport access vlan 10" in cfg
    assert "interface GigabitEthernet0/1" in cfg
    assert "switchport mode trunk" in cfg
    assert "ip default-gateway 192.168.1.1" in cfg

