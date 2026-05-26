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

function AdminTopProductsChart({ data }) {
  return (
    <div className="admin-chart-card">
      <div className="admin-card-heading">
        <h2>Top Products</h2>
        <span>By paid revenue</span>
      </div>

      <div className="admin-chart-frame">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,102,82,0.22)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
            <YAxis tickFormatter={(value) => `₹${value}`} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="revenue" fill="#2e211d" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdminTopProductsChart;
