import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import AdminRoute from './components/AdminRoute';
import Inventory from './components/Inventory';
import Dashboard from './components/Dashboard';
import BillingSummary from './components/BillingSummary';
import VariantManager from './components/VariantManager';
import BulkLabelGenerator from './components/BulkLabelGenerator';

import 'bootstrap/dist/css/bootstrap.min.css';
import SalesDashboard from './components/SalesDashboard';

const root = ReactDOM.createRoot(document.getElementById('root'));

const routes = createBrowserRouter([
    {path: "/", element: <HomePage/>},
    {path: "/login", element: <LoginPage />},
    {path: "/admin/products/:productId/variants", element: <AdminRoute children={<VariantManager />}></AdminRoute>},
    {path: "/admin/dashboard", element: <AdminRoute children={<Dashboard />}></AdminRoute>},
    {path: "/admin/inventory", element: <AdminRoute children={<Inventory />}></AdminRoute>},
    {path: "/admin/billing", element: <AdminRoute children={<BillingSummary />}></AdminRoute>},
    {path: "/admin/print-labels", element: <AdminRoute children={<BulkLabelGenerator />}></AdminRoute>},
    {path: "/admin/sales", element: <AdminRoute children={<SalesDashboard />}></AdminRoute>},
    {path: "*", element: <div>404 Not Found</div>}
]);

root.render(
    <React.StrictMode>
        <RouterProvider router={routes} />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
