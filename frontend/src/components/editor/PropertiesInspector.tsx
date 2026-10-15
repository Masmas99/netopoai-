'use client';

import React, { useState, useEffect } from 'react';
import { DeviceConfig, InterfaceConfig, StaticRoute } from '@/types/topology';
import { X, Trash2, Plus, Server, Network, Router, Monitor } from 'lucide-react';

interface PropertiesInspectorProps {
  device: DeviceConfig | null;
  onUpdateDevice: (updated: DeviceConfig) => void;
  onDeleteDevice: (deviceId: string) => void;
  onClose: () => void;
}

export function PropertiesInspector({
  device,
  onUpdateDevice,
  onDeleteDevice,
  onClose,
}: PropertiesInspectorProps) {
  const [currentDev, setCurrentDev] = useState<DeviceConfig | null>(device);

  useEffect(() => {
    setCurrentDev(device);
  }, [device]);

  if (!currentDev) return null;

  const handleHostnameChange = (name: string) => {
    const updated = { ...currentDev, hostname: name };
    setCurrentDev(updated);
    onUpdateDevice(updated);
  };

  const handleGatewayChange = (gw: string) => {
    const updated = { ...currentDev, default_gateway: gw };
    setCurrentDev(updated);
    onUpdateDevice(updated);
  };

  const handleInterfaceChange = (index: number, field: keyof InterfaceConfig, value: unknown) => {
    const ifaces = [...currentDev.interfaces];
    ifaces[index] = { ...ifaces[index], [field]: value };
    const updated = { ...currentDev, interfaces: ifaces };
    setCurrentDev(updated);
    onUpdateDevice(updated);
  };

  const handleAddStaticRoute = () => {
    const newRoute: StaticRoute = {
      destination_network: '192.168.0.0',
      subnet_mask: '255.255.255.0',
      next_hop: '',
    };
    const updated = {
      ...currentDev,
      static_routes: [...(currentDev.static_routes || []), newRoute],
    };
    setCurrentDev(updated);
    onUpdateDevice(updated);
  };

  const handleRemoveStaticRoute = (routeIdx: number) => {
    const routes = currentDev.static_routes.filter((_, idx) => idx !== routeIdx);
    const updated = { ...currentDev, static_routes: routes };
    setCurrentDev(updated);
    onUpdateDevice(updated);
  };

  const handleUpdateStaticRoute = (routeIdx: number, field: keyof StaticRoute, val: string) => {
    const routes = [...currentDev.static_routes];
    routes[routeIdx] = { ...routes[routeIdx], [field]: val };
    const updated = { ...currentDev, static_routes: routes };
    setCurrentDev(updated);
    onUpdateDevice(updated);
  };

  const isRouter = currentDev.device_type === 'router' || currentDev.device_type === 'layer3_switch';
  const isHost = currentDev.device_type === 'pc' || currentDev.device_type === 'server' || currentDev.device_type === 'laptop';

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full text-white overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Device Inspector</h3>
          <p className="text-xs text-slate-500 font-mono">{currentDev.model}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeleteDevice(currentDev.id)}
            title="Delete Device"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Basic Info */}
        <div className="space-y-3">
          <div>
            <label className="text-slate-400 font-medium block mb-1">Hostname</label>
            <input
              type="text"
              value={currentDev.hostname}
              onChange={(e) => handleHostnameChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          {(isHost || currentDev.device_type === 'switch') && (
            <div>
              <label className="text-slate-400 font-medium block mb-1">Default Gateway</label>
              <input
                type="text"
                placeholder="e.g. 192.168.1.1"
                value={currentDev.default_gateway || ''}
                onChange={(e) => handleGatewayChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          )}
        </div>

        {/* Interfaces */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-semibold text-slate-300">Interfaces ({currentDev.interfaces.length})</span>
          </div>

          <div className="space-y-3">
            {currentDev.interfaces.map((iface, idx) => (
              <div key={iface.id} className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px] text-sky-300">
                  <span>{iface.name}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{iface.interface_type}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">IP Address</span>
                    <input
                      type="text"
                      placeholder="e.g. 192.168.1.1"
                      value={iface.ip_address || ''}
                      onChange={(e) => handleInterfaceChange(idx, 'ip_address', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] font-mono text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Subnet Mask</span>
                    <input
                      type="text"
                      placeholder="e.g. 255.255.255.0"
                      value={iface.subnet_mask || ''}
                      onChange={(e) => handleInterfaceChange(idx, 'subnet_mask', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] font-mono text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Static Routing for Routers */}
        {isRouter && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-semibold text-slate-300">Static Routes</span>
              <button
                onClick={handleAddStaticRoute}
                className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
              >
                <Plus className="w-3.5 h-3.5" /> Add Route
              </button>
            </div>

            {currentDev.static_routes?.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No static routes configured.</p>
            ) : (
              currentDev.static_routes?.map((route, rIdx) => (
                <div key={rIdx} className="p-2 bg-slate-800/80 rounded border border-slate-700 space-y-1.5 relative">
                  <button
                    onClick={() => handleRemoveStaticRoute(rIdx)}
                    className="absolute top-1.5 right-1.5 text-slate-500 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Dest Network & Mask</span>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={route.destination_network}
                        onChange={(e) => handleUpdateStaticRoute(rIdx, 'destination_network', e.target.value)}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-mono"
                      />
                      <input
                        type="text"
                        value={route.subnet_mask}
                        onChange={(e) => handleUpdateStaticRoute(rIdx, 'subnet_mask', e.target.value)}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Next Hop IP</span>
                    <input
                      type="text"
                      placeholder="e.g. 10.0.0.2"
                      value={route.next_hop || ''}
                      onChange={(e) => handleUpdateStaticRoute(rIdx, 'next_hop', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-mono"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

