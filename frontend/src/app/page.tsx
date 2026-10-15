'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection as FlowConnection,
  Edge,
  Node,
  MarkerType,
} from '@xyflow/react';

import { CiscoDeviceNode } from '@/components/nodes/CiscoDeviceNode';
import { DevicePalette } from '@/components/editor/DevicePalette';
import { PropertiesInspector } from '@/components/editor/PropertiesInspector';
import { ConnectionModal } from '@/components/editor/ConnectionModal';
import { ValidationDrawer } from '@/components/editor/ValidationDrawer';

import {
  Topology,
  DeviceConfig,
  Connection,
  MediumType,
  ValidationReport,
  ValidationIssue,
} from '@/types/topology';
import { CatalogDevice, createDeviceFromCatalog } from '@/lib/catalog';
import {
  Network,
  Download,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  FileCode,
  HelpCircle,
  X,
} from 'lucide-react';

const nodeTypes = {
  ciscoDevice: CiscoDeviceNode,
};

// Initial default lab: 2-Router Static Routing Lab
const initialTopology: Topology = {
  schema_version: '1.0',
  name: 'Cisco Static Routing Lab',
  description: 'Two routers connected via Serial WAN with LANs on each side',
  devices: [
    {
      id: 'R1',
      hostname: 'Router1',
      device_type: 'router',
      model: 'Cisco 1941',
      position: { x: 300, y: 150 },
      interfaces: [
        {
          id: 'r1_g0',
          name: 'GigabitEthernet0/0',
          device_id: 'R1',
          interface_type: 'GigabitEthernet',
          ip_address: '192.168.1.1',
          subnet_mask: '255.255.255.0',
          is_shutdown: false,
          is_trunk: false,
        },
        {
          id: 'r1_s0',
          name: 'Serial0/0/0',
          device_id: 'R1',
          interface_type: 'Serial',
          ip_address: '10.0.0.1',
          subnet_mask: '255.255.255.252',
          clock_rate: 64000,
          is_shutdown: false,
          is_trunk: false,
        },
      ],
      static_routes: [
        { destination_network: '192.168.2.0', subnet_mask: '255.255.255.0', next_hop: '10.0.0.2' },
      ],
      custom_commands: [],
    },
    {
      id: 'R2',
      hostname: 'Router2',
      device_type: 'router',
      model: 'Cisco 1941',
      position: { x: 650, y: 150 },
      interfaces: [
        {
          id: 'r2_g0',
          name: 'GigabitEthernet0/0',
          device_id: 'R2',
          interface_type: 'GigabitEthernet',
          ip_address: '192.168.2.1',
          subnet_mask: '255.255.255.0',
          is_shutdown: false,
          is_trunk: false,
        },
        {
          id: 'r2_s0',
          name: 'Serial0/0/0',
          device_id: 'R2',
          interface_type: 'Serial',
          ip_address: '10.0.0.2',
          subnet_mask: '255.255.255.252',
          is_shutdown: false,
          is_trunk: false,
        },
      ],
      static_routes: [
        { destination_network: '192.168.1.0', subnet_mask: '255.255.255.0', next_hop: '10.0.0.1' },
      ],
      custom_commands: [],
    },
    {
      id: 'SW1',
      hostname: 'Switch1',
      device_type: 'switch',
      model: 'Cisco 2960-24TT',
      position: { x: 150, y: 320 },
      interfaces: [
        { id: 'sw1_f1', name: 'FastEthernet0/1', device_id: 'SW1', interface_type: 'FastEthernet', is_shutdown: false, is_trunk: false },
        { id: 'sw1_g1', name: 'GigabitEthernet0/1', device_id: 'SW1', interface_type: 'GigabitEthernet', is_shutdown: false, is_trunk: false },
      ],
      static_routes: [],
      custom_commands: [],
    },
    {
      id: 'SW2',
      hostname: 'Switch2',
      device_type: 'switch',
      model: 'Cisco 2960-24TT',
      position: { x: 800, y: 320 },
      interfaces: [
        { id: 'sw2_f1', name: 'FastEthernet0/1', device_id: 'SW2', interface_type: 'FastEthernet', is_shutdown: false, is_trunk: false },
        { id: 'sw2_g1', name: 'GigabitEthernet0/1', device_id: 'SW2', interface_type: 'GigabitEthernet', is_shutdown: false, is_trunk: false },
      ],
      static_routes: [],
      custom_commands: [],
    },
    {
      id: 'PC1',
      hostname: 'PC1',
      device_type: 'pc',
      model: 'Standard PC',
      default_gateway: '192.168.1.1',
      position: { x: 50, y: 460 },
      interfaces: [
        { id: 'pc1_f0', name: 'FastEthernet0', device_id: 'PC1', interface_type: 'FastEthernet', ip_address: '192.168.1.10', subnet_mask: '255.255.255.0', is_shutdown: false, is_trunk: false },
      ],
      static_routes: [],
      custom_commands: [],
    },
    {
      id: 'PC2',
      hostname: 'PC2',
      device_type: 'pc',
      model: 'Standard PC',
      default_gateway: '192.168.2.1',
      position: { x: 900, y: 460 },
      interfaces: [
        { id: 'pc2_f0', name: 'FastEthernet0', device_id: 'PC2', interface_type: 'FastEthernet', ip_address: '192.168.2.10', subnet_mask: '255.255.255.0', is_shutdown: false, is_trunk: false },
      ],
      static_routes: [],
      custom_commands: [],
    },
  ],
  connections: [
    { id: 'c1', source_device_id: 'PC1', source_interface: 'FastEthernet0', target_device_id: 'SW1', target_interface: 'FastEthernet0/1', medium: 'copper_straight', status: 'UP' },
    { id: 'c2', source_device_id: 'SW1', source_interface: 'GigabitEthernet0/1', target_device_id: 'R1', target_interface: 'GigabitEthernet0/0', medium: 'copper_straight', status: 'UP' },
    { id: 'c3', source_device_id: 'R1', source_interface: 'Serial0/0/0', target_device_id: 'R2', target_interface: 'Serial0/0/0', medium: 'serial', status: 'UP' },
    { id: 'c4', source_device_id: 'R2', source_interface: 'GigabitEthernet0/0', target_device_id: 'SW2', target_interface: 'GigabitEthernet0/1', medium: 'copper_straight', status: 'UP' },
    { id: 'c5', source_device_id: 'SW2', source_interface: 'FastEthernet0/1', target_device_id: 'PC2', target_interface: 'FastEthernet0', medium: 'copper_straight', status: 'UP' },
  ],
  subnets: [
    { id: 's1', name: 'LAN-1', network_address: '192.168.1.0', prefix_length: 24, subnet_mask: '255.255.255.0', broadcast_address: '192.168.1.255', usable_host_start: '192.168.1.1', usable_host_end: '192.168.1.254', total_usable_hosts: 254, required_hosts: 30, gateway_ip: '192.168.1.1', assigned_device_ids: ['PC1', 'R1'] },
    { id: 's2', name: 'WAN-Link', network_address: '10.0.0.0', prefix_length: 30, subnet_mask: '255.255.255.252', broadcast_address: '10.0.0.3', usable_host_start: '10.0.0.1', usable_host_end: '10.0.0.2', total_usable_hosts: 2, required_hosts: 2, gateway_ip: '10.0.0.1', assigned_device_ids: ['R1', 'R2'] },
    { id: 's3', name: 'LAN-2', network_address: '192.168.2.0', prefix_length: 24, subnet_mask: '255.255.255.0', broadcast_address: '192.168.2.255', usable_host_start: '192.168.2.1', usable_host_end: '192.168.2.254', total_usable_hosts: 254, required_hosts: 30, gateway_ip: '192.168.2.1', assigned_device_ids: ['PC2', 'R2'] },
  ],
  requirements: [],
};

export default function TopologyEditorPage() {
  const [topology, setTopology] = useState<Topology>(initialTopology);
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [cliConfigs, setCliConfigs] = useState<Record<string, string>>({});
  const [pendingConnection, setPendingConnection] = useState<{
    source: DeviceConfig;
    target: DeviceConfig;
  } | null>(null);
  const [showPktModal, setShowPktModal] = useState(false);
  const [textPrompt, setTextPrompt] = useState('');
  const [showPromptModal, setShowPromptModal] = useState(false);

  // Convert canonical topology devices to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    return topology.devices.map((dev) => {
      const devErrors = validationReport?.errors?.some(
        (e) => e.target_type === 'device' && e.target_id === dev.id
      );
      const devWarnings = validationReport?.warnings?.some(
        (w) => w.target_type === 'device' && w.target_id === dev.id
      );

      return {
        id: dev.id,
        type: 'ciscoDevice',
        position: dev.position,
        data: {
          device: dev,
          hasErrors: devErrors,
          hasWarnings: devWarnings,
        },
      };
    });
  }, [topology.devices, validationReport]);

  // Convert canonical topology connections to React Flow edges
  const edges: Edge[] = useMemo(() => {
    return topology.connections.map((conn) => {
      const isSerial = conn.medium === 'serial';
      return {
        id: conn.id,
        source: conn.source_device_id,
        target: conn.target_device_id,
        label: `${conn.source_interface} ⇄ ${conn.target_interface}`,
        animated: isSerial,
        style: {
          stroke: isSerial ? '#ef4444' : '#0284c7',
          strokeWidth: isSerial ? 2.5 : 2,
          strokeDasharray: isSerial ? '5,5' : undefined,
        },
        labelStyle: { fill: '#cbd5e1', fontSize: 10, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#0f172a', fillOpacity: 0.85 },
        markerEnd: { type: MarkerType.ArrowClosed, color: isSerial ? '#ef4444' : '#0284c7' },
      };
    });
  }, [topology.connections]);

  // Handle node position changes
  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      setTopology((prev) => ({
        ...prev,
        devices: prev.devices.map((d) =>
          d.id === node.id ? { ...d, position: node.position } : d
        ),
      }));
    },
    []
  );

  // Handle node click (selection)
  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      const dev = topology.devices.find((d) => d.id === node.id);
      if (dev) setSelectedDevice(dev);
    },
    [topology.devices]
  );

  // Handle canvas link connection trigger
  const onConnect = useCallback(
    (params: FlowConnection) => {
      if (!params.source || !params.target || params.source === params.target) return;
      const srcDev = topology.devices.find((d) => d.id === params.source);
      const tgtDev = topology.devices.find((d) => d.id === params.target);
      if (srcDev && tgtDev) {
        setPendingConnection({ source: srcDev, target: tgtDev });
      }
    },
    [topology.devices]
  );

  // Confirm connection from modal
  const handleConfirmConnection = (
    srcIface: string,
    tgtIface: string,
    medium: MediumType
  ) => {
    if (!pendingConnection) return;
    const newConn: Connection = {
      id: `conn_${Date.now()}`,
      source_device_id: pendingConnection.source.id,
      source_interface: srcIface,
      target_device_id: pendingConnection.target.id,
      target_interface: tgtIface,
      medium,
      status: 'UP',
    };

    setTopology((prev) => ({
      ...prev,
      connections: [...prev.connections, newConn],
    }));
    setPendingConnection(null);
  };

  // Add device from palette
  const handleAddDevice = (cat: CatalogDevice) => {
    const nextIdx = topology.devices.length + 1;
    let prefix = 'DEV';
    if (cat.device_type === 'router') prefix = 'R';
    else if (cat.device_type === 'switch') prefix = 'SW';
    else if (cat.device_type === 'pc') prefix = 'PC';
    else if (cat.device_type === 'server') prefix = 'SRV';

    const id = `${prefix}${nextIdx}`;
    const hostname = `${prefix}${nextIdx}`;
    const newDev = createDeviceFromCatalog(cat.model, id, hostname, {
      x: 350 + Math.random() * 150,
      y: 200 + Math.random() * 100,
    });

    setTopology((prev) => ({
      ...prev,
      devices: [...prev.devices, newDev],
    }));
    setSelectedDevice(newDev);
  };

  // Update device from properties panel
  const handleUpdateDevice = (updated: DeviceConfig) => {
    setTopology((prev) => ({
      ...prev,
      devices: prev.devices.map((d) => (d.id === updated.id ? updated : d)),
    }));
    setSelectedDevice(updated);
  };

  // Delete device
  const handleDeleteDevice = (deviceId: string) => {
    setTopology((prev) => ({
      ...prev,
      devices: prev.devices.filter((d) => d.id !== deviceId),
      connections: prev.connections.filter(
        (c) => c.source_device_id !== deviceId && c.target_device_id !== deviceId
      ),
    }));
    setSelectedDevice(null);
  };

  // Validate Topology via Backend API (with graceful fallback)
  const handleRunValidation = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/topology/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topology),
      });
      if (res.ok) {
        const data = await res.json();
        setValidationReport(data);
      }
    } catch {
      // Local client-side fallback validation if FastAPI server is offline
      const errors: ValidationIssue[] = [];
      const warnings: ValidationIssue[] = [];
      if (topology.devices.length === 0) {
        errors.push({
          code: 'EMPTY_TOPOLOGY',
          message: 'Topology canvas has no devices.',
          severity: 'error',
          target_type: 'global',
        });
      }
      setValidationReport({ is_valid: errors.length === 0, errors, warnings, info: [] });
    }

    // Also generate CLI configs
    try {
      const resCfg = await fetch('http://localhost:8000/api/topology/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topology),
      });
      if (resCfg.ok) {
        const cfgs = await resCfg.json();
        setCliConfigs(cfgs);
      }
    } catch {
      // Offline fallback simple generator
      const fallbackCfgs: Record<string, string> = {};
      topology.devices.forEach((d) => {
        fallbackCfgs[d.hostname] = `! Cisco Configuration for ${d.hostname}\nhostname ${d.hostname}\n! Interfaces\n` +
          d.interfaces.filter(i => i.ip_address).map(i => `interface ${i.name}\n ip address ${i.ip_address} ${i.subnet_mask || '255.255.255.0'}\n no shutdown`).join('\n') +
          '\nend\n';
      });
      setCliConfigs(fallbackCfgs);
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(topology, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topology.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export all CLI configurations as a combined text file
  const handleExportAllCli = () => {
    let combined = `! ========================================================\n! NetTopo AI — Combined Cisco IOS Device Configurations\n! Topology: ${topology.name}\n! ========================================================\n\n`;
    topology.devices.forEach((d) => {
      combined += (cliConfigs[d.hostname] || `! Device ${d.hostname}\nhostname ${d.hostname}\n`) + '\n\n';
    });

    const blob = new Blob([combined], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topology.name.toLowerCase().replace(/\s+/g, '_')}_all_configs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* Top Navigation Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-30 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-lg">
            <Network className="w-6 h-6" />
            <span>NetTopo AI</span>
          </div>
          <span className="text-slate-600">|</span>
          <input
            type="text"
            value={topology.name}
            onChange={(e) => setTopology({ ...topology, name: e.target.value })}
            className="bg-transparent hover:bg-slate-800 px-2 py-1 rounded text-sm font-medium text-slate-200 border border-transparent hover:border-slate-700 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPromptModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Text to Topology</span>
          </button>

          <button
            onClick={handleRunValidation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Validate & Build CLI</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleExportAllCli}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download All CLI</span>
          </button>

          <button
            onClick={() => setShowPktModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>.pkt Status</span>
          </button>
        </div>
      </header>

      {/* Main Workspace: Left Catalog, Canvas, Right Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Device Catalog */}
        <DevicePalette onAddDevice={handleAddDevice} />

        {/* Center Canvas */}
        <div className="flex-1 h-full bg-slate-950 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            onConnect={onConnect}
            fitView
            minZoom={0.2}
            maxZoom={2}
          >
            <Background color="#1e293b" gap={20} size={1.5} />
            <Controls className="!bg-slate-900 !border-slate-800 !text-white fill-white" />
            <MiniMap
              nodeColor="#0284c7"
              maskColor="rgba(15, 23, 42, 0.7)"
              className="!bg-slate-900 !border-slate-800 rounded-lg overflow-hidden"
            />
          </ReactFlow>
        </div>

        {/* Right Properties Inspector */}
        {selectedDevice && (
          <PropertiesInspector
            device={selectedDevice}
            onUpdateDevice={handleUpdateDevice}
            onDeleteDevice={handleDeleteDevice}
            onClose={() => setSelectedDevice(null)}
          />
        )}
      </div>

      {/* Bottom Diagnostic & Output Drawer */}
      <ValidationDrawer
        report={validationReport}
        topology={topology}
        cliConfigs={cliConfigs}
        onRunValidation={handleRunValidation}
      />

      {/* Connection Modal */}
      {pendingConnection && (
        <ConnectionModal
          sourceDevice={pendingConnection.source}
          targetDevice={pendingConnection.target}
          existingConnections={topology.connections}
          onConfirm={handleConfirmConnection}
          onCancel={() => setPendingConnection(null)}
        />
      )}

      {/* Packet Tracer .pkt Feasibility Disclosure Modal */}
      {showPktModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Cisco Packet Tracer (.pkt) Export Status
              </h3>
              <button onClick={() => setShowPktModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>Sesuai PRD.md & PROMPT.md:</strong> NetTopo AI tidak akan pernah mengganti ekstensi file JSON atau ZIP menjadi <code>.pkt</code> untuk mengklaim kompatibilitas palsu.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="text-amber-400 font-semibold">Hasil Feasibility Study:</div>
                <p>• File <code>.pkt</code> versi modern (PT 7.x/8.x) menggunakan format biner proprietary terenkripsi tanpa API publik mandiri.</p>
                <p>• Packet Tracer menyediakan IPC via PTMP pada port TCP 39000 yang mensyaratkan aplikasi PT aktif di desktop.</p>
              </div>
              <div>
                <span className="font-semibold text-slate-200">Format Ekspor Resmi yang Berfungsi Penuh:</span>
                <ul className="list-disc list-inside mt-1 space-y-1 text-slate-400">
                  <li><strong>Skrip Cisco IOS CLI (.cfg):</strong> Tinggal copy-paste ke tab CLI / console setiap perangkat di Packet Tracer.</li>
                  <li><strong>JSON Spesifikasi:</strong> Model kanonikal lengkap untuk backup dan versioning.</li>
                  <li><strong>Tabel VLSM & IP Plan:</strong> Panduan subnetting dan addressing yang rapi.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowPktModal(false)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Paham & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text to Topology Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-sky-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Text to Cisco Topology
              </h3>
              <button onClick={() => setShowPromptModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Masukkan deskripsi jaringan atau soal praktikum yang ingin Anda buat:
              </p>
              <textarea
                rows={4}
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                placeholder="Contoh: Buat topologi dengan 2 router Cisco 1941 terhubung kabel serial 10.0.0.0/30, masing-masing memiliki 1 LAN switch dan 1 PC dengan static routing..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-sky-500"
              />
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span>Atau pilih template:</span>
                <button
                  onClick={() => {
                    setTopology(initialTopology);
                    setShowPromptModal(false);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700"
                >
                  2-Router Static Route Lab
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowPromptModal(false)}
                className="px-3 py-1.5 rounded text-slate-400 hover:text-white text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowPromptModal(false);
                  handleRunValidation();
                }}
                className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Generate Topologi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
