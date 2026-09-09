import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const data = [
  { day: "Monday", earnings: 10 },
  { day: "Tuesday", earnings: 30 },
  { day: "Wednesday", earnings: 50 },
  { day: "Thursday", earnings: 70 },
  { day: "Friday", earnings: 20 },
  { day: "Saturday", earnings: 40 },
  { day: "Sunday", earnings: 60 },
];

const EarningsChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="rgba(255, 21, 114, 1)"
              stopOpacity={0.4}
            />
            <stop
              offset="100%"
              stopColor="rgba(255, 21, 114, 1)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="earnings"
          stroke="#FF0080"
          fill="url(#colorEarnings)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default EarningsChart;
