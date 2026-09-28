import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  children,
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-800 border-rose-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-medium",
    md: "text-xs px-2.5 py-0.5 font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

import { CardStatus, InventoryStatus, BatchStatus } from "@/types";

export function StatusBadge({ status }: { status: CardStatus | InventoryStatus | BatchStatus | string }) {
  switch (status?.toLowerCase()) {
    case "active":
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Active
        </Badge>
      );
    case "in_stock":
      return (
        <Badge variant="info">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          In Stock
        </Badge>
      );
    case "sold":
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Sold / Ready
        </Badge>
      );
    case "draft":
    case "generated":
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          {status === "generated" ? "Generated" : "Draft"}
        </Badge>
      );
    case "printed":
      return (
        <Badge variant="info">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          Printed
        </Badge>
      );
    case "nfc_programmed":
      return (
        <Badge variant="info">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
          NFC Programmed
        </Badge>
      );
    case "tested":
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
          Tested
        </Badge>
      );
    case "suspended":
      return (
        <Badge variant="danger">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          Suspended
        </Badge>
      );
    case "lost":
      return (
        <Badge variant="danger">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          Lost
        </Badge>
      );
    case "archived":
      return (
        <Badge variant="neutral">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Archived
        </Badge>
      );
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}
