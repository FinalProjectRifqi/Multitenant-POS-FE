"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SalesTrendPoint } from "@/lib/types/analytics";

function formatRupiah(value: number): string {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)}rb`;
  }
  return `Rp ${value}`;
}

type ChartMode = "omzet" | "transaksi";

interface SalesTrendChartProps {
  data?: SalesTrendPoint[];
  isLoading: boolean;
}

export function SalesTrendChart({
  data = [],
  isLoading,
}: SalesTrendChartProps) {
  const [mode, setMode] = useState<ChartMode>("omzet");
  const axisTick = { fontSize: 12, fill: "#6b5156", fontWeight: 600 };

  return (
    <Card className="h-full bg-primary-foreground">
      <CardHeader className="flex flex-row items-center justify-between px-5 pb-3 pt-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-primary opacity-70" />
          <h3 className="text-lg font-semibold leading-none">
            Tren Penjualan
          </h3>
        </div>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant={mode === "omzet" ? "default" : "outline"}
            className="h-8 px-3 text-sm font-semibold"
            onClick={() => setMode("omzet")}
          >
            Omzet
          </Button>
          <Button
            size="sm"
            variant={mode === "transaksi" ? "default" : "outline"}
            className="h-8 px-3 text-sm font-semibold"
            onClick={() => setMode("transaksi")}
          >
            Transaksi
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-5">
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : data.length === 0 ? (
          <p className="py-12 text-center text-sm font-medium text-muted-foreground">
            Belum ada data penjualan
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={data}
              margin={{ top: 8, right: 12, left: 2, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="colorOmzetPrimary"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="colorTransaksiSecondary"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#8f3144" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8f3144" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="label"
                tick={axisTick}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={mode === "omzet" ? formatRupiah : undefined}
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                width={64}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                }}
                formatter={(value) =>
                  mode === "omzet"
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(Number(value))
                    : String(value)
                }
                labelStyle={{ fontWeight: 700 }}
              />
              {mode === "omzet" ? (
                <Area
                  type="monotone"
                  dataKey="omzet"
                  stroke="var(--color-primary)"
                  fill="url(#colorOmzetPrimary)"
                  strokeWidth={2}
                  name="Omzet"
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="transaksi"
                  stroke="#8f3144"
                  fill="url(#colorTransaksiSecondary)"
                  strokeWidth={2}
                  name="Transaksi"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
