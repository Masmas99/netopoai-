export type DeviceType = 'router' | 'switch' | 'layer3_switch' | 'pc' | 'server' | 'laptop';

export type InterfaceType = 'FastEthernet' | 'GigabitEthernet' | 'Serial' | 'Fiber';

export type MediumType = 'copper_straight' | 'copper_cross' | 'serial' | 'fiber';

export interface InterfaceConfig {
  id: string;
  name: string;
  device_id: string;
  interface_type: InterfaceType;
  ip_address?: string;
  subnet_mask?: string;
  prefix_length?: number;
  is_shutdown: boolean;
  vlan_id?: number;
  is_trunk: boolean;
  clock_rate?: number;
  connected_to_device_id?: string;
  connected_to_interface?: string;
}

export interface StaticRoute {
  destination_network: string;
  subnet_mask: string;
  next_hop?: string;
  exit_interface?: string;
}

export interface DeviceConfig {
  id: string;
  hostname: string;
  device_type: DeviceType;
  model: string;
  position: { x: number; y: number };
  interfaces: InterfaceConfig[];
  default_gateway?: string;
  dns_server?: string;
  static_routes: StaticRoute[];
  custom_commands: string[];
  role?: string;
}

export interface Connection {
  id: string;
  source_device_id: string;
  source_interface: string;
  target_device_id: string;
  target_interface: string;
  medium: MediumType;
  status: string;
}

export interface SubnetPlan {
  id: string;
  name: string;
  network_address: string;
  prefix_length: number;
  subnet_mask: string;
  broadcast_address: string;
  usable_host_start: string;
  usable_host_end: string;
  total_usable_hosts: number;
  required_hosts: number;
  gateway_ip?: string;
  vlan_id?: number;
  assigned_device_ids: string[];
}

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  code: string;
  message: string;
  severity: ValidationSeverity;
  target_type: 'device' | 'connection' | 'subnet' | 'global';
  target_id?: string;
  suggestion?: string;
}

export interface ValidationReport {
  is_valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
}

export interface Requirement {
  id: string;
  description: string;
  is_explicit: boolean;
  is_mandatory: boolean;
  is_satisfied: boolean;
  notes?: string;
}

export interface Topology {
  schema_version: string;
  name: string;
  description?: string;
  devices: DeviceConfig[];
  connections: Connection[];
  subnets: SubnetPlan[];
  requirements: Requirement[];
  metadata?: Record<string, unknown>;
}

