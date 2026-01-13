import React, { useState } from 'react';
import { Table, Form, Button, Badge } from 'react-bootstrap';
import { PencilSquare, CheckLg, XCircle, Trash } from 'react-bootstrap-icons';
import axios from 'axios';

const BACKEND_API_URL = process.env.REACT_APP_API_URL;

const AvailableVariantsTable = ({ availableVariants, setAvailableVariants }) => {
    const [editingId, setEditingId] = useState(null); 
    const [tempStock, setTempStock] = useState("");   

    const startEditing = (v, ind) => {
        setEditingId(ind);
        setTempStock(v.stockQuantity);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setTempStock("");
    };

    const handleUpdate = async (variant) => {
        try {
            // We send the whole variant object or just fields required by ProductVariant entity
            // The backend updateStock expects the ProductVariant object
            await axios.put(`${BACKEND_API_URL}/admin/variants/update-stock`, {
                ...variant,
                stockQuantity: parseInt(tempStock)
            });

            // Update local state
            setAvailableVariants(availableVariants.map(v =>
                v.id === variant.id ? { ...v, stockQuantity: parseInt(tempStock) } : v
            ));
            setEditingId(null);
        } catch (err) {
            console.error(err);
            alert("Failed to update stock: " + (err.response?.data || "Server Error"));
        }
    };

    const handleDelete = async (variantId) => {
        if (window.confirm("Are you sure you want to delete this variant? This cannot be undone.")) {
            try {
                await axios.delete(`${BACKEND_API_URL}/admin/variants/${variantId}`);
                setAvailableVariants(availableVariants.filter(v => v.id !== variantId));
            } catch (err) {
                alert("Error deleting variant");
            }
        }
    };

    if (availableVariants.length === 0) {
        return <div className="p-4 text-center text-muted">No variants registered for this product yet.</div>;
    }

    return (
        <Table hover responsive className="align-middle border-0 m-0">
            <thead className="bg-light text-uppercase small">
                <tr>
                    <th className="ps-3">SKU (Scan ID)</th>
                    <th>Size</th>
                    <th>Color</th>
                    <th>Added Price</th>
                    <th style={{ width: '160px' }}>Quantity</th>
                    <th>Status</th>
                    <th className="text-end pe-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                {availableVariants.map((v, ind) => (
                    <tr key={v.id || ind}>
                        <td className="ps-3">
                            <code className="text-primary fw-bold">{v.variantUniqueId || 'GEN-PENDING'}</code>
                        </td>
                        <td><strong>{v.size}</strong></td>
                        <td><span className="text-muted">{v.color}</span></td>
                        <td>₹{v.additionalPrice}</td>
                        <td style={{ backgroundColor: editingId === ind ? '#f0f7ff' : 'transparent' }}>
                            {editingId === ind ? (
                                <div className="input-group input-group-sm">
                                    <Form.Control
                                        type="number"
                                        className="border-primary text-center fw-bold"
                                        value={tempStock}
                                        onChange={(e) => setTempStock(e.target.value)}
                                        autoFocus
                                        min="0"
                                    />
                                    <Button variant="primary" onClick={() => handleUpdate(v)}>
                                        <CheckLg />
                                    </Button>
                                    <Button variant="outline-secondary" onClick={cancelEditing}>
                                        <XCircle />
                                    </Button>
                                </div>
                            ) : (
                                <div 
                                    className="d-flex align-items-center justify-content-between"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => startEditing(v, ind)}
                                >
                                    <span className={`fs-6 fw-bold ${v.stockQuantity === 0 ? 'text-danger' : 'text-dark'}`}>
                                        {v.stockQuantity} <small className="fw-normal text-muted">pcs</small>
                                    </span>
                                    <PencilSquare size={12} className="text-primary opacity-50" />
                                </div>
                            )}
                        </td>
                        <td>
                            <Badge pill bg={v.stockQuantity >= 5 ? "success" : v.stockQuantity > 0 ? "warning" : "danger"}>
                                {v.stockQuantity >= 5 ? "Healthy" : v.stockQuantity > 0 ? "Low Stock" : "Out"}
                            </Badge>
                        </td>
                        <td className="text-end pe-3">
                            <Button 
                                variant="link" 
                                className="text-danger p-0" 
                                onClick={() => handleDelete(v.id)}
                                disabled={editingId === ind}
                            >
                                <Trash size={18} />
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default AvailableVariantsTable;