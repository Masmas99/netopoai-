'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Router, Network, Monitor, Server, Laptop, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DeviceConfig } from '@/types/topology';

interface CiscoNodeData {
  device: DeviceConfig;
  hasErrors?: boolean;
  hasWarnings?: boolean;
  onSelectDevice?: (device: DeviceConfig) => void;
}

export const CiscoDeviceNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as CiscoNodeData;
  const { device, hasErrors, hasWarnings } = nodeData;

  const getDeviceIcon = () => {
    switch (device.device_type) {
      case 'router':
        return <Router className="w-8 h-8 text-sky-400" />;
      case 'switch':
      case 'layer3_switch':
        return <Network className="w-8 h-8 text-emerald-400" />;
      case 'server':
        return <Server className="w-8 h-8 text-indigo-400" />;
      case 'laptop':
        return <Laptop className="w-8 h-8 text-amber-400" />;
      default:
        return <Monitor className="w-8 h-8 text-blue-400" />;
    }
  };

  const getBorderColor = () => {
    if (selected) return 'border-sky-500 ring-2 ring-sky-500/50 shadow-lg shadow-sky-500/20';
    if (hasErrors) return 'border-rose-500 ring-1 ring-rose-500/50';
    if (hasWarnings) return 'border-amber-500';
    return 'border-slate-700 hover:border-slate-500';
  };

  const configuredIps = device.interfaces
    .filter((i) => i.ip_address)
    .map((i) => `${i.name}: ${i.ip_address}`);

  return (
    <div
      className={`relative px-4 py-3 bg-slate-900 text-white rounded-xl border-2 transition-all duration-150 min-w-[170px] shadow-md ${getBorderColor()}`}
    >
      {/* React Flow Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-sky-500 !border-2 !border-slate-900 rounded-full hover:scale-125 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-sky-500 !border-2 !border-slate-900 rounded-full hover:scale-125 transition-transform"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-sky-500 !border-2 !border-slate-900 rounded-full hover:scale-125 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-sky-500 !border-2 !border-slate-900 rounded-full hover:scale-125 transition-transform"
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-800 rounded-lg flex items-center justify-center">
          {getDeviceIcon()}
        </div>
        <div className="overflow-hidden">
          <div className="font-bold text-sm text-slate-100 truncate">{device.hostname}</div>
          <div className="text-[10px] text-slate-400 font-mono truncate">{device.model}</div>
        </div>
      </div>

      {/* Interface / IP Badges */}
      <div className="mt-2 pt-2 border-t border-slate-800 flex flex-col gap-0.5">
        {configuredIps.length > 0 ? (
          configuredIps.slice(0, 2).map((ipStr, idx) => (
            <div key={idx} className="text-[10px] text-sky-300 font-mono truncate">
              {ipStr}
            </div>
          ))
        ) : (
          <div className="text-[10px] text-slate-500 italic">No IP configured</div>
        )}
      </div>

      {/* Error / Warning Alert Badge */}
      {hasErrors && (
        <div className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full shadow">
          <AlertCircle className="w-3.5 h-3.5" />
        </div>
      )}
      {!hasErrors && hasWarnings && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 p-1 rounded-full shadow">
          <AlertCircle className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
});

CiscoDeviceNode.displayName = 'CiscoDeviceNode';

