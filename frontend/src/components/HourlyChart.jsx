import React, { memo, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

function HourlyChart({ hourlyForecast = [] }) {
  const data = useMemo(
    () =>
      hourlyForecast.map((hour) => ({
        time: new Date(hour.label).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temp: hour.temp,
        feelsLike: hour.feelsLike ?? hour.temp,
      })),
    [hourlyForecast]
  );

  if (!hourlyForecast.length) return null;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            Temperature Trend
          </h2>
          <p className="text-sm text-slate-400">
            Next 24 Hours
          </p>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-[1500px] h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 10,
                bottom: 10,
              }}
            >
              <defs>
                <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#334155"
                strokeDasharray="4 4"
                vertical={false}
              />
                            <XAxis
                dataKey="time"
                stroke="#94a3b8"
                interval={0}
                tick={{ fontSize: 12 }}
                minTickGap={20}
              />

              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{
                  stroke: "#60a5fa",
                  strokeWidth: 2,
                }}
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "14px",
                  color: "#fff",
                  boxShadow: "0 10px 30px rgba(0,0,0,.4)",
                }}
                formatter={(value, name) => [
                  `${value}°C`,
                  name === "temp" ? "Temperature" : "Feels Like",
                ]}
              />

              <Legend
                wrapperStyle={{
                  color: "#fff",
                }}
              />

              <Area
                type="monotone"
                dataKey="temp"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#tempFill)"
                dot={false}
                activeDot={{
                  r: 7,
                  fill: "#fff",
                  stroke: "#3B82F6",
                  strokeWidth: 3,
                }}
                animationDuration={1200}
              />

              <Line
                type="monotone"
                dataKey="feelsLike"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={false}
                animationDuration={1200}
              />

              <ReferenceLine
                y={data[0]?.temp}
                stroke="#475569"
                strokeDasharray="5 5"
              />
                          </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default memo(HourlyChart);