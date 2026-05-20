import React from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";

// ─── Page Header ─────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-base text-primary/90 font-semibold">
            {description}
          </p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

// ─── Dashboard Card ───────────────────────────────────────────────────────────
interface DashboardCardProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  title: string;
  description: string;
  href: string;
  linkLabel?: string;
}

export function DashboardCard({
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  title,
  description,
  href,
  linkLabel = "Lihat Menu",
}: DashboardCardProps) {
  return (
    <div className="group bg-primary-foreground rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300 flex flex-col gap-4">
      <div
        className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 space-y-1.5">
        <h2 className="font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      <Link
        href={href}
        className="text-xs font-medium text-primary hover:underline underline-offset-2 self-start"
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
}: StatsCardProps) {
  return (
    <div className="bg-primary rounded-2xl border border-border p-5 flex flex-col gap-3 text-primary-foreground">
      <div className="flex items-center justify-between">
        <span className="text-sm text-primary-foreground font-medium">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-primary-foreground">{value}</p>
        {/* {trend && (
          <p className={`text-xs mt-1 font-medium ${trendUp ? "text-green-600" : "text-red-500"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </p>
        )} */}
      </div>
    </div>
  );
}
