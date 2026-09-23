"use client";

import React from "react";
import { Smartphone, Apple, Monitor, HelpCircle } from "lucide-react";

interface DeviceBreakdownProps {
  devices: {
    android: number;
    iphone: number;
    desktop: number;
    other: number;
  };
}

export function DeviceBreakdown({ devices }: DeviceBreakdownProps) {
  const total = devices.android + devices.iphone + devices.desktop + devices.other || 1;

  const stats = [
    {
      name: "Android",
      count: devices.android,
      percent: Math.round((devices.android / total) * 100),
      icon: Smartphone,
    },
    {
      name: "iPhone (iOS)",
      count: devices.iphone,
      percent: Math.round((devices.iphone / total) * 100),
      icon: Apple,
    },
    {
      name: "Desktop OS",
      count: devices.desktop,
      percent: Math.round((devices.desktop / total) * 100),
      icon: Monitor,
    },
    {
      name: "Other",
      count: devices.other,
      percent: Math.round((devices.other / total) * 100),
      icon: HelpCircle,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Device Breakdown</h3>
        <span className="text-[11px] text-slate-500">Operating System</span>
      </div>

      <div className="space-y-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 tabular-nums text-[11px]">
                    {item.count.toLocaleString()}
                  </span>
                  <span className="font-semibold text-slate-900 w-8 text-right tabular-nums">
                    {item.percent}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${item.percent}%` }}
                  className="h-full bg-slate-700 rounded-full"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
