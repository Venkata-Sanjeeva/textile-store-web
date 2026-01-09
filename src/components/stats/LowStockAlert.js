import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LowStockAlert = () => {
    const [lowStock, setLowStock] = useState([]);

    useEffect(() => {
        // You'll need to create this endpoint in Spring Boot
        axios.get('http://localhost:8080/api/admin/products/low-stock')
            .then(res => setLowStock(res.data));
    }, []);

    return (
        <div className="card shadow mb-4">
            <div className="card-header text-danger">⚠️ Critical Low Stock</div>
            <div className="card-body">
                <table className="table">
                    <thead>
                        <tr><th>Product</th><th>Stock</th></tr>
                    </thead>
                    <tbody>
                        {lowStock.length > 0 ? lowStock.map(p => (
                            <tr key={p.id}>
                                <td>{p.name}</td>
                                <td className="text-danger font-weight-bold">{p.currentStock}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="2" className="text-center">No low stock items</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LowStockAlert;
