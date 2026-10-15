"""
Cisco Device Catalog for NetTopo AI.
Contains accurate hardware profiles, interface templates, and capabilities
matching Cisco Packet Tracer device models.
"""

from enum import Enum
from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class DeviceType(str, Enum):
    ROUTER = "router"
    SWITCH = "switch"
    LAYER3_SWITCH = "layer3_switch"
    PC = "pc"
    SERVER = "server"
    LAPTOP = "laptop"


class InterfaceType(str, Enum):
    FAST_ETHERNET = "FastEthernet"
    GIGABIT_ETHERNET = "GigabitEthernet"
    SERIAL = "Serial"
    FIBER = "Fiber"


class MediumType(str, Enum):
    COPPER_STRAIGHT = "copper_straight"
    COPPER_CROSS = "copper_cross"
    SERIAL = "serial"
    FIBER = "fiber"


class InterfaceTemplate(BaseModel):
    name: str = Field(..., description="Canonical interface name, e.g. GigabitEthernet0/0")
    interface_type: InterfaceType
    speed_mbps: int = Field(default=1000)
    slot: Optional[str] = None


class DeviceProfile(BaseModel):
    model: str
    device_type: DeviceType
    description: str
    is_layer3: bool = False
    default_interfaces: List[InterfaceTemplate]
    supported_routing_protocols: List[str] = Field(default_factory=list)


CISCO_CATALOG: Dict[str, DeviceProfile] = {
    "Cisco 1941": DeviceProfile(
        model="Cisco 1941",
        device_type=DeviceType.ROUTER,
        description="Modular Integrated Services Router (ISR) G2 with 2 integrated GE ports",
        is_layer3=True,
        default_interfaces=[
            InterfaceTemplate(name="GigabitEthernet0/0", interface_type=InterfaceType.GIGABIT_ETHERNET, speed_mbps=1000),
            InterfaceTemplate(name="GigabitEthernet0/1", interface_type=InterfaceType.GIGABIT_ETHERNET, speed_mbps=1000),
            InterfaceTemplate(name="Serial0/0/0", interface_type=InterfaceType.SERIAL, speed_mbps=2),
            InterfaceTemplate(name="Serial0/0/1", interface_type=InterfaceType.SERIAL, speed_mbps=2),
        ],
        supported_routing_protocols=["static", "rip", "ospf", "eigrp"],
    ),
    "Cisco 2901": DeviceProfile(
        model="Cisco 2901",
        device_type=DeviceType.ROUTER,
        description="ISR G2 Router with 2 integrated GE ports and 4 EHWIC slots",
        is_layer3=True,
        default_interfaces=[
            InterfaceTemplate(name="GigabitEthernet0/0", interface_type=InterfaceType.GIGABIT_ETHERNET, speed_mbps=1000),
            InterfaceTemplate(name="GigabitEthernet0/1", interface_type=InterfaceType.GIGABIT_ETHERNET, speed_mbps=1000),
            InterfaceTemplate(name="Serial0/0/0", interface_type=InterfaceType.SERIAL, speed_mbps=2),
            InterfaceTemplate(name="Serial0/0/1", interface_type=InterfaceType.SERIAL, speed_mbps=2),
        ],
        supported_routing_protocols=["static", "rip", "ospf", "eigrp"],
    ),
    "Cisco 2911": DeviceProfile(
        model="Cisco 2911",
        device_type=DeviceType.ROUTER,
        description="ISR G2 Router with 3 integrated GE ports and 4 EHWIC slots",
        is_layer3=True,
        default_interfaces=[
            InterfaceTemplate(name="GigabitEthernet0/0", interface_type=InterfaceType.GIGABIT_ETHERNET, speed_mbps=1000),
            InterfaceTemplate(name="GigabitEthernet0/1", interface_type=InterfaceType.GIGABIT_ETHERNET, speed_mbps=1000),
            InterfaceTemplate(name="GigabitEthernet0/2", interface_type=InterfaceType.GIGABIT_ETHERNET, speed_mbps=1000),
            InterfaceTemplate(name="Serial0/0/0", interface_type=InterfaceType.SERIAL, speed_mbps=2),
            InterfaceTemplate(name="Serial0/0/1", interface_type=InterfaceType.SERIAL, speed_mbps=2),
        ],
        supported_routing_protocols=["static", "rip", "ospf", "eigrp"],
    ),
    "Cisco 2960-24TT": DeviceProfile(
        model="Cisco 2960-24TT",
        device_type=DeviceType.SWITCH,
        description="Catalyst 2960 Layer 2 Switch with 24 10/100 ports + 2 10/100/1000 uplinks",
        is_layer3=False,
        default_interfaces=[
            *(InterfaceTemplate(name=f"FastEthernet0/{i}", interface_type=InterfaceType.FAST_ETHERNET, speed_mbps=100) for i in range(1, 25)),
            InterfaceTemplate(name="GigabitEthernet0/1", interface_type=InterfaceType.GIGABIT_ETHERNET, speed_mbps=1000),
            InterfaceTemplate(name="GigabitEthernet0/2", interface_type=InterfaceType.GIGABIT_ETHERNET, speed_mbps=1000),
        ],
        supported_routing_protocols=[],
    ),
    "Cisco 3560-24PS": DeviceProfile(
        model="Cisco 3560-24PS",
        device_type=DeviceType.LAYER3_SWITCH,
        description="Catalyst 3560 Multilayer Switch with 24 10/100 PoE ports + 2 SFP uplinks",
        is_layer3=True,
        default_interfaces=[
            *(InterfaceTemplate(name=f"FastEthernet0/{i}", interface_type=InterfaceType.FAST_ETHERNET, speed_mbps=100) for i in range(1, 25)),
            InterfaceTemplate(name="GigabitEthernet0/1", interface_type=InterfaceType.GIGABIT_ETHERNET, speed_mbps=1000),
            InterfaceTemplate(name="GigabitEthernet0/2", interface_type=InterfaceType.GIGABIT_ETHERNET, speed_mbps=1000),
        ],
        supported_routing_protocols=["static", "rip", "ospf", "eigrp"],
    ),
    "Standard PC": DeviceProfile(
        model="Standard PC",
        device_type=DeviceType.PC,
        description="General desktop host workstation",
        is_layer3=False,
        default_interfaces=[
            InterfaceTemplate(name="FastEthernet0", interface_type=InterfaceType.FAST_ETHERNET, speed_mbps=100),
        ],
        supported_routing_protocols=[],
    ),
    "Standard Server": DeviceProfile(
        model="Standard Server",
        device_type=DeviceType.SERVER,
        description="General network server (DHCP, DNS, Web)",
        is_layer3=False,
        default_interfaces=[
            InterfaceTemplate(name="FastEthernet0", interface_type=InterfaceType.FAST_ETHERNET, speed_mbps=100),
            InterfaceTemplate(name="GigabitEthernet0", interface_type=InterfaceType.GIGABIT_ETHERNET, speed_mbps=1000),
        ],
        supported_routing_protocols=[],
    ),
}


def get_device_profile(model: str) -> Optional[DeviceProfile]:
    return CISCO_CATALOG.get(model)

