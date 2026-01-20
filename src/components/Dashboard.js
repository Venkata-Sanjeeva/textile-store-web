import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatsCard from './stats/StatsCard';
import CategoryChart from './stats/CategoryChart';
import LowStockAlert from './stats/LowStockAlert';
import NavbarComponent from './NavbarComponent';
import "../styles/Dashboard.css";
import BrandChart from './stats/BrandChart';

const BACKEND_API_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        axios.get(`${BACKEND_API_URL}/admin/products/stats`)
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <>
            <NavbarComponent />
            <div className="admin-dashboard p-4">
                <div className="dashboard-header mb-4">
                    <h2 className="m-0">Analytics</h2>
                    <p className="text-muted">Charts generated dynamically based on inventory data.</p>
                </div>
                {!stats ? <div className="loading">Loading Analytics...</div>
                    : <>
                        <div className="stats-grid">
                            {/* 1. Numerical Stats - No longer wrapped in a Bootstrap 'row' */}
                            <StatsCard title="Total Inventory Value" value={`₹ ${stats.totalValue}`} color="primary" />
                            <StatsCard title="Items in Stock" value={stats.totalStock} color="success" />
                            <StatsCard title="Out of Stock" value={stats.outOfStockCount} color="danger" />
                        </div>

                        {/* 2. Visual Distribution & Alerts - Kept as row for side-by-side view */}
                        <div className="row mt-4">
                            {/* Charts side-by-side */}
                            <div className="col-md-6">
                                <CategoryChart data={stats.categoryDistribution} />
                            </div>
                            <div className="col-md-6">
                                <BrandChart data={stats.brandDistribution} />
                            </div>
                            
                            {/* Alert spanning full width below */}
                            <div className="col-12 mt-4">
                                <LowStockAlert />
                            </div>
                        </div>
                    </>
                }
            </div>
        </>
    );
};

export default Dashboard;