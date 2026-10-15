"""
Canonical Topology Data Model for NetTopo AI (v1.0).
Strict, versioned Pydantic v2 schemas for devices, interfaces, links, networks,
requirements, and validation reports.
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from app.core.catalog import DeviceType, InterfaceType, MediumType


class CanvasPosition(BaseModel):
    x: float = Field(default=0.0)
    y: float = Field(default=0.0)


class InterfaceConfig(BaseModel):
    id: str = Field(..., description="Unique interface ID, e.g. dev1_g0_0")
    name: str = Field(..., description="Interface name, e.g. GigabitEthernet0/0")
    device_id: str
    interface_type: InterfaceType
    ip_address: Optional[str] = Field(None, description="IPv4 address, e.g. 192.168.1.1")
    subnet_mask: Optional[str] = Field(None, description="Subnet mask, e.g. 255.255.255.0")
    prefix_length: Optional[int] = Field(None, ge=0, le=32)
    is_shutdown: bool = Field(default=False)
    vlan_id: Optional[int] = Field(None, ge=1, le=4094)
    is_trunk: bool = Field(default=False)
    clock_rate: Optional[int] = Field(None, description="DCE serial clock rate, e.g. 64000")
    connected_to_device_id: Optional[str] = None
    connected_to_interface: Optional[str] = None


class StaticRoute(BaseModel):
    destination_network: str = Field(..., description="Destination network, e.g. 192.168.2.0")
    subnet_mask: str = Field(..., description="Subnet mask, e.g. 255.255.255.0")
    next_hop: Optional[str] = Field(None, description="Next hop IP, e.g. 10.0.0.2")
    exit_interface: Optional[str] = Field(None, description="Exit interface, e.g. GigabitEthernet0/1")


class DeviceConfig(BaseModel):
    id: str = Field(..., description="Unique device ID, e.g. R1, SW1, PC1")
    hostname: str
    device_type: DeviceType
    model: str
    position: CanvasPosition = Field(default_factory=CanvasPosition)
    interfaces: List[InterfaceConfig] = Field(default_factory=list)
    default_gateway: Optional[str] = None
    dns_server: Optional[str] = None
    static_routes: List[StaticRoute] = Field(default_factory=list)
    custom_commands: List[str] = Field(default_factory=list)
    role: Optional[str] = Field(None, description="Role: Core, Distribution, Access, Gateway, Host")

    def get_interface(self, name: str) -> Optional[InterfaceConfig]:
        for iface in self.interfaces:
            if iface.name.lower() == name.lower():
                return iface
        return None


class Connection(BaseModel):
    id: str = Field(..., description="Unique connection ID")
    source_device_id: str
    source_interface: str
    target_device_id: str
    target_interface: str
    medium: MediumType = Field(default=MediumType.COPPER_STRAIGHT)
    status: str = Field(default="UP")


class SubnetPlan(BaseModel):
    id: str
    name: str = Field(..., description="e.g. LAN-A, WAN-1")
    network_address: str = Field(..., description="e.g. 192.168.1.0")
    prefix_length: int = Field(..., ge=0, le=32)
    subnet_mask: str = Field(..., description="e.g. 255.255.255.0")
    broadcast_address: str = Field(..., description="e.g. 192.168.1.255")
    usable_host_start: str = Field(..., description="e.g. 192.168.1.1")
    usable_host_end: str = Field(..., description="e.g. 192.168.1.254")
    total_usable_hosts: int
    required_hosts: int = 0
    gateway_ip: Optional[str] = None
    vlan_id: Optional[int] = None
    assigned_device_ids: List[str] = Field(default_factory=list)


class Requirement(BaseModel):
    id: str
    description: str
    is_explicit: bool = True
    is_mandatory: bool = True
    is_satisfied: bool = False
    notes: Optional[str] = None


class ValidationSeverity(str, Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class ValidationIssue(BaseModel):
    code: str
    message: str
    severity: ValidationSeverity
    target_type: str = Field(..., description="'device', 'connection', 'subnet', or 'global'")
    target_id: Optional[str] = None
    suggestion: Optional[str] = None


class ValidationReport(BaseModel):
    is_valid: bool
    errors: List[ValidationIssue] = Field(default_factory=list)
    warnings: List[ValidationIssue] = Field(default_factory=list)
    info: List[ValidationIssue] = Field(default_factory=list)


class Topology(BaseModel):
    schema_version: str = Field(default="1.0")
    name: str = Field(default="Untitled Topology")
    description: Optional[str] = None
    devices: List[DeviceConfig] = Field(default_factory=list)
    connections: List[Connection] = Field(default_factory=list)
    subnets: List[SubnetPlan] = Field(default_factory=list)
    requirements: List[Requirement] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    def get_device(self, device_id: str) -> Optional[DeviceConfig]:
        for dev in self.devices:
            if dev.id == device_id:
                return dev
        return None

