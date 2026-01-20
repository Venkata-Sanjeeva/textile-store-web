import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BrandChart = ({ data }) => {
    const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

    // Helper to shorten long names (e.g., "Peter England" -> "Peter Engl...")
    const formatXAxis = (tickItem) => {
        return tickItem.length > 10 ? `${tickItem.substring(0, 10)}...` : tickItem;
    };

    return (
        <div className="card shadow mb-4">
            <div className="card-header font-weight-bold text-primary">Variants Distribution by Brand</div>
            <div className="card-body" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            tickFormatter={formatXAxis} 
                            interval={0} // Forces all labels to show
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            allowDecimals={false} // Removes decimals like 1.5, 2.5
                            label={{ value: 'Variants', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                            // Show full name in tooltip even if truncated on axis
                        />
                        <Bar dataKey="value" name="Total Variants" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BrandChart;