import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import NavbarComponent from './NavbarComponent';

const BACKEND_API_URL = process.env.REACT_APP_API_URL;

const SalesDashboard = () => {
    const [view, setView] = useState('daily');
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
    const [loading, setLoading] = useState(true);

    // Fetch data whenever the "view" (daily/monthly) changes
    useEffect(() => {
        fetchSalesData();
    }, [view]);

    const fetchSalesData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BACKEND_API_URL}/admin/sales/stats?view=${view}`);
            const result = await response.json();

            // Sort data chronologically by label before setting state
            const sortedData = result.chartData.sort((a, b) => a.label.localeCompare(b.label));

            setData(sortedData);
            setStats({
                totalRevenue: result.totalRevenue,
                totalOrders: result.totalOrders
            });
        } catch (error) {
            console.error("Error fetching sales data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <NavbarComponent />
            <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: '#333' }}>Sales Overview</h2>
                    <div style={{ background: '#eee', padding: '5px', borderRadius: '8px' }}>
                        <button
                            onClick={() => setView('daily')}
                            style={{
                                padding: '8px 20px',
                                backgroundColor: view === 'daily' ? '#007bff' : 'transparent',
                                color: view === 'daily' ? 'white' : '#555',
                                border: 'none', borderRadius: '6px', cursor: 'pointer', transition: '0.3s'
                            }}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setView('monthly')}
                            style={{
                                padding: '8px 20px',
                                backgroundColor: view === 'monthly' ? '#007bff' : 'transparent',
                                color: view === 'monthly' ? 'white' : '#555',
                                border: 'none', borderRadius: '6px', cursor: 'pointer', transition: '0.3s'
                            }}
                        >
                            Monthly
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div style={cardStyle}>
                        <p style={labelStyle}>Total Revenue ({view})</p>
                        <h3 style={valueStyle}>₹{(stats.totalRevenue || 0).toLocaleString()}</h3>
                    </div>
                    {/* <div style={cardStyle}>
                        <p style={labelStyle}>Total Items Sold</p>
                        <h3 style={valueStyle}>{(stats.totalOrders || 0).toLocaleString()} Units</h3>
                    </div> */}
                </div>

                {/* Chart Section */}
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: '400px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            {view === 'daily' ? (
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="label" /> {/* 'label' will be the hour or date string from Java */}
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                                </BarChart>
                            ) : (
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} name="Revenue (₹)" />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </>
    );
};

// Internal Styles
const cardStyle = { background: '#fff', padding: '20px', borderRadius: '12px', flex: 1, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const labelStyle = { margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: '500' };
const valueStyle = { margin: '8px 0 0 0', fontSize: '24px', color: '#111827' };

export default SalesDashboard;