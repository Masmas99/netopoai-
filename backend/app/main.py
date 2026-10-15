"""
FastAPI application for NetTopo AI backend service.
Provides REST endpoints for topology validation, deterministic IP addressing / VLSM,
Cisco IOS CLI configuration generation, device catalog, and export capabilities.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
from pydantic import BaseModel, Field

from app.core.catalog import CISCO_CATALOG, DeviceProfile
from app.models.topology import (
    Topology, ValidationReport, SubnetPlan
)
from app.engine.validator import TopologyValidator
from app.engine.ip_addressing import (
    calculate_vlsm, calculate_subnet_details, IPAddressingError
)
from app.engine.config_generator import CiscoConfigGenerator

app = FastAPI(
    title="NetTopo AI Backend API",
    description="Deterministic Cisco Network Topology Validation, Addressing, and Configuration Engine",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VLSMRequest(BaseModel):
    major_network: str = Field(..., examples=["192.168.1.0/24"])
    requirements: List[Dict[str, Any]] = Field(
        ...,
        examples=[[
            {"name": "LAN-Sales", "required_hosts": 50},
            {"name": "LAN-Eng", "required_hosts": 25},
            {"name": "WAN-Link", "required_hosts": 2},
        ]]
    )


class SubnetCalculateRequest(BaseModel):
    network_cidr: str = Field(..., examples=["192.168.1.0/24"])


@app.get("/api/health", tags=["Health"])
def get_health() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "service": "NetTopo AI Engine",
        "version": "1.0.0",
        "features": {
            "deterministic_vlsm": True,
            "static_graph_validator": True,
            "cisco_ios_generator": True,
            "pkt_direct_export": False,
        }
    }


@app.get("/api/catalog/devices", response_model=Dict[str, DeviceProfile], tags=["Catalog"])
def get_device_catalog():
    """Returns the list of supported Cisco routers, switches, and endpoints."""
    return CISCO_CATALOG


@app.post("/api/topology/validate", response_model=ValidationReport, tags=["Topology"])
def validate_topology(topology: Topology):
    """Deterministically validates a complete network topology specification."""
    validator = TopologyValidator(topology)
    return validator.validate()


@app.post("/api/topology/ip-plan/vlsm", response_model=List[SubnetPlan], tags=["IP Addressing"])
def plan_vlsm(req: VLSMRequest):
    """Calculates non-overlapping VLSM subnets based on required host counts."""
    try:
        return calculate_vlsm(req.major_network, req.requirements)
    except IPAddressingError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.post("/api/topology/ip-plan/calculate", tags=["IP Addressing"])
def calculate_subnet(req: SubnetCalculateRequest):
    """Calculates network details for a given CIDR block."""
    try:
        return calculate_subnet_details(req.network_cidr)
    except IPAddressingError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.post("/api/topology/configure", response_model=Dict[str, str], tags=["Configuration"])
def generate_configurations(topology: Topology):
    """Generates Cisco IOS CLI configuration scripts for all devices in the topology."""
    generator = CiscoConfigGenerator(topology)
    return generator.generate_all_configs()


@app.get("/api/export/feasibility/pkt", tags=["Export"])
def get_pkt_feasibility():
    """
    Returns the technical feasibility report and disclosure regarding Cisco Packet Tracer .pkt export.
    """
    return {
        "pkt_supported": False,
        "reason": "Cisco Packet Tracer .pkt format is a closed, proprietary encrypted binary format.",
        "supported_alternatives": [
            "Cisco IOS CLI scripts (.cfg / .txt) per device",
            "Topology JSON specification",
            "Vector diagram (SVG)",
            "High-resolution diagram (PNG)",
            "Comprehensive summary report (PDF)",
            "All-in-one ZIP archive"
        ],
        "experimental_roadmap": "Packet Tracer PTMP IPC desktop bridge on TCP port 39000."
    }

