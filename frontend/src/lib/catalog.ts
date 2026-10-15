import { DeviceType, InterfaceType, DeviceConfig } from '@/types/topology';

export interface CatalogDevice {
  model: string;
  device_type: DeviceType;
  description: string;
  is_layer3: boolean;
  interfaces: { name: string; type: InterfaceType }[];
}

export const CISCO_CATALOG_LIST: CatalogDevice[] = [
  {
    model: 'Cisco 1941',
    device_type: 'router',
    description: 'Modular ISR G2 Router with 2 GE and 2 Serial ports',
    is_layer3: true,
    interfaces: [
      { name: 'GigabitEthernet0/0', type: 'GigabitEthernet' },
      { name: 'GigabitEthernet0/1', type: 'GigabitEthernet' },
      { name: 'Serial0/0/0', type: 'Serial' },
      { name: 'Serial0/0/1', type: 'Serial' },
    ],
  },
  {
    model: 'Cisco 2911',
    device_type: 'router',
    description: 'ISR G2 Router with 3 GE and 2 Serial ports',
    is_layer3: true,
    interfaces: [
      { name: 'GigabitEthernet0/0', type: 'GigabitEthernet' },
      { name: 'GigabitEthernet0/1', type: 'GigabitEthernet' },
      { name: 'GigabitEthernet0/2', type: 'GigabitEthernet' },
      { name: 'Serial0/0/0', type: 'Serial' },
      { name: 'Serial0/0/1', type: 'Serial' },
    ],
  },
  {
    model: 'Cisco 2960-24TT',
    device_type: 'switch',
    description: 'Catalyst Layer 2 Switch (24 FE + 2 GE)',
    is_layer3: false,
    interfaces: [
      ...Array.from({ length: 24 }, (_, i) => ({
        name: `FastEthernet0/${i + 1}`,
        type: 'FastEthernet' as InterfaceType,
      })),
      { name: 'GigabitEthernet0/1', type: 'GigabitEthernet' },
      { name: 'GigabitEthernet0/2', type: 'GigabitEthernet' },
    ],
  },
  {
    model: 'Cisco 3560-24PS',
    device_type: 'layer3_switch',
    description: 'Catalyst Multilayer L3 Switch (24 FE + 2 GE)',
    is_layer3: true,
    interfaces: [
      ...Array.from({ length: 24 }, (_, i) => ({
        name: `FastEthernet0/${i + 1}`,
        type: 'FastEthernet' as InterfaceType,
      })),
      { name: 'GigabitEthernet0/1', type: 'GigabitEthernet' },
      { name: 'GigabitEthernet0/2', type: 'GigabitEthernet' },
    ],
  },
  {
    model: 'Standard PC',
    device_type: 'pc',
    description: 'Host Workstation with 1 FE port',
    is_layer3: false,
    interfaces: [{ name: 'FastEthernet0', type: 'FastEthernet' }],
  },
  {
    model: 'Standard Server',
    device_type: 'server',
    description: 'Network Server (DHCP, DNS, Web)',
    is_layer3: false,
    interfaces: [
      { name: 'FastEthernet0', type: 'FastEthernet' },
      { name: 'GigabitEthernet0', type: 'GigabitEthernet' },
    ],
  },
];

export function createDeviceFromCatalog(
  model: string,
  id: string,
  hostname: string,
  position = { x: 100, y: 100 }
): DeviceConfig {
  const cat = CISCO_CATALOG_LIST.find((c) => c.model === model) || CISCO_CATALOG_LIST[0];
  return {
    id,
    hostname,
    device_type: cat.device_type,
    model: cat.model,
    position,
    interfaces: cat.interfaces.map((iface, idx) => ({
      id: `${id}_if_${idx}`,
      name: iface.name,
      device_id: id,
      interface_type: iface.type,
      is_shutdown: false,
      is_trunk: false,
    })),
    static_routes: [],
    custom_commands: [],
  };
}

