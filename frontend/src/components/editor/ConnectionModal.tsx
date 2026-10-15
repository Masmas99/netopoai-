'use client';

import React, { useState } from 'react';
import { DeviceConfig, Connection, MediumType } from '@/types/topology';
import { Cable, X, Check } from 'lucide-react';

interface ConnectionModalProps {
  sourceDevice: DeviceConfig;
  targetDevice: DeviceConfig;
  existingConnections: Connection[];
  onConfirm: (sourceInterface: string, targetInterface: string, medium: MediumType) => void;
  onCancel: () => void;
}

export function ConnectionModal({
  sourceDevice,
  targetDevice,
  existingConnections,
  onConfirm,
  onCancel,
}: ConnectionModalProps) {
  // Find already used interfaces
  const isInterfaceUsed = (deviceId: string, ifaceName: string) => {
    return existingConnections.some(
      (c) =>
        (c.source_device_id === deviceId && c.source_interface.toLowerCase() === ifaceName.toLowerCase()) ||
        (c.target_device_id === deviceId && c.target_interface.toLowerCase() === ifaceName.toLowerCase())
    );
  };

  const availableSourceIfaces = sourceDevice.interfaces.filter(
    (i) => !isInterfaceUsed(sourceDevice.id, i.name)
  );
  const availableTargetIfaces = targetDevice.interfaces.filter(
    (i) => !isInterfaceUsed(targetDevice.id, i.name)
  );

  const [selectedSource, setSelectedSource] = useState<string>(
    availableSourceIfaces[0]?.name || sourceDevice.interfaces[0]?.name || ''
  );
  const [selectedTarget, setSelectedTarget] = useState<string>(
    availableTargetIfaces[0]?.name || targetDevice.interfaces[0]?.name || ''
  );

  // Auto-detect default medium
  const srcIfaceObj = sourceDevice.interfaces.find((i) => i.name === selectedSource);
  const tgtIfaceObj = targetDevice.interfaces.find((i) => i.name === selectedTarget);
  const isSerial = srcIfaceObj?.interface_type === 'Serial' && tgtIfaceObj?.interface_type === 'Serial';

  const [medium, setMedium] = useState<MediumType>(isSerial ? 'serial' : 'copper_straight');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSource || !selectedTarget) return;
    onConfirm(selectedSource, selectedTarget, medium);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 text-white shadow-2xl space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sky-400 font-semibold">
            <Cable className="w-5 h-5" />
            <h3>Connect Link</h3>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Source Port */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              {sourceDevice.hostname} Port:
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-sky-500"
            >
              {sourceDevice.interfaces.map((i) => {
                const used = isInterfaceUsed(sourceDevice.id, i.name);
                return (
                  <option key={i.id} value={i.name} disabled={used}>
                    {i.name} ({i.interface_type}){used ? ' - Connected' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Target Port */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              {targetDevice.hostname} Port:
            </label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-sky-500"
            >
              {targetDevice.interfaces.map((i) => {
                const used = isInterfaceUsed(targetDevice.id, i.name);
                return (
                  <option key={i.id} value={i.name} disabled={used}>
                    {i.name} ({i.interface_type}){used ? ' - Connected' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Medium Type */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Cable Medium:</label>
            <select
              value={medium}
              onChange={(e) => setMedium(e.target.value as MediumType)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-sky-500 capitalize"
            >
              <option value="copper_straight">Copper Straight-Through (Switch to Router/PC)</option>
              <option value="copper_cross">Copper Cross-Over (Similar devices / Switch-Switch)</option>
              <option value="serial">Serial DTE / DCE (WAN Link)</option>
              <option value="fiber">Fiber Optic</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Connect Cable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

