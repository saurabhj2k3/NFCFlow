import React from "react";
import { cn } from "@/lib/utils";

export function CardBox({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-slate-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  trendLabel?: string;
  color?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tabular-nums tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="text-emerald-700 font-semibold">{trend}</span>
              <span className="text-slate-400">{trendLabel || "vs last period"}</span>
            </div>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
