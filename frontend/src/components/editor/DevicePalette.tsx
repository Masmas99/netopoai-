'use client';

import React from 'react';
import { CISCO_CATALOG_LIST, CatalogDevice } from '@/lib/catalog';
import { Router, Network, Monitor, Server, Plus } from 'lucide-react';

interface DevicePaletteProps {
  onAddDevice: (device: CatalogDevice) => void;
}

export function DevicePalette({ onAddDevice }: DevicePaletteProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'router':
        return <Router className="w-5 h-5 text-sky-400" />;
      case 'switch':
      case 'layer3_switch':
        return <Network className="w-5 h-5 text-emerald-400" />;
      case 'server':
        return <Server className="w-5 h-5 text-indigo-400" />;
      default:
        return <Monitor className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-white select-none">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
          Cisco Device Catalog
        </h2>
        <p className="text-xs text-slate-500 mt-1">Click to add to canvas</p>
      </div>

      <div className="p-3 flex-1 overflow-y-auto space-y-2">
        {CISCO_CATALOG_LIST.map((dev) => (
          <div
            key={dev.model}
            onClick={() => onAddDevice(dev)}
            className="flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 hover:border-sky-500/50 cursor-pointer transition-all duration-150 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-slate-900 rounded-md group-hover:scale-105 transition-transform">
                {getIcon(dev.device_type)}
              </div>
              <div>
                <div className="text-xs font-medium text-slate-200">{dev.model}</div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {dev.device_type.replace('_', ' ')} • {dev.interfaces.length} ports
                </div>
              </div>
            </div>
            <button className="text-slate-500 group-hover:text-sky-400 transition-colors p-1">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

