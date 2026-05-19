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

  return (
    <Card className="h-full bg-primary-foreground">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-primary opacity-70" />
          <h3 className="text-sm font-semibold">Tren Penjualan</h3>
        </div>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant={mode === "omzet" ? "default" : "outline"}
            className="h-7 text-xs px-2.5"
            onClick={() => setMode("omzet")}
          >
            Omzet
          </Button>
          <Button
            size="sm"
            variant={mode === "transaksi" ? "default" : "outline"}
            className="h-7 text-xs px-2.5"
            onClick={() => setMode("transaksi")}
          >
            Transaksi
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Belum ada data penjualan
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={data}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
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
                  id="colorTransaksiGreen"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={mode === "omzet" ? formatRupiah : undefined}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
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
                labelStyle={{ fontWeight: 600 }}
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
                  stroke="#16a34a"
                  fill="url(#colorTransaksiGreen)"
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
