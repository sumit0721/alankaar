import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "../../utils/formatCurrency.js";

function AdminRevenueChart({ data }) {
  return (
    <div className="admin-chart-card">
      <div className="admin-card-heading">
        <h2>Monthly Revenue</h2>
        <span>Last 6 months</span>
      </div>

      <div className="admin-chart-frame">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,102,82,0.22)" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `₹${value}`} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="revenue" fill="#be6a4a" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdminRevenueChart;
