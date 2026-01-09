import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const CategoryChart = ({ data }) => {
    // Transform { "Electronics": 5 } into [{ name: "Electronics", value: 5 }]
    const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="card shadow mb-4">
            <div className="card-header">Inventory by Category</div>
            <div className="card-body" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8" label>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CategoryChart;