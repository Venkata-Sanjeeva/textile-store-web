import React, { useState } from 'react';
import { Table, Form, Button, Badge } from 'react-bootstrap';
import { PencilSquare, CheckLg, XCircle, Trash } from 'react-bootstrap-icons'; // Assuming you use bootstrap-icons
import axios from 'axios';

const AvailableVariantsTable = ({ availableVariants, setAvailableVariants }) => {

    const [editingId, setEditingId] = useState(null); // Stores the ID of the row being edited
    const [tempStock, setTempStock] = useState("");   // Stores the value while typing

    // Start editing a row
    const startEditing = (v) => {
        setEditingId(v.id);
        setTempStock(v.stockQuantity);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingId(null);
        setTempStock("");
    };

    // Save update to Backend
    const handleUpdate = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/admin/variants/update-stock`, {
                id: id,
                stockQuantity: tempStock
            });

            // Update local state to reflect change
            setAvailableVariants(availableVariants.map(v =>
                v.id === id ? { ...v, stockQuantity: tempStock } : v
            ));
            setEditingId(null);
        } catch (err) {
            alert("Failed to update stock");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this variant?")) {
            try {
                await axios.delete(`http://localhost:8080/api/admin/variants/${id}`);
                setAvailableVariants(availableVariants.filter(v => v.id !== id));
            } catch (err) {
                alert("Error deleting variant");
            }
        }
    };

    if (availableVariants.length === 0) {
        return <p className="text-muted">No variants available</p>;
    }

    return (
        <Table hover responsive className="align-middle border shadow-sm m-0">
            <thead className="bg-light text-uppercase small">
                <tr>
                    <th>Size</th>
                    <th>Color</th>
                    <th>Added Price</th>
                    <th style={{ width: '150px' }}>Quantity</th>
                    <th style={{ width: '100px' }}>Status</th>
                    <th style={{ width: '250px' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {availableVariants.map((v) => (
                    <tr key={v.id}>
                        <td>
                            <strong>{v.size}</strong>
                        </td>
                        <td>
                            <span className="text-muted">{v.color}</span>
                        </td>
                        <td>+ ₹{v.additionalPrice}</td>
                        <td style={{ backgroundColor: editingId === v.id ? '#f8f9ff' : 'transparent' }}>
                            {editingId === v.id ? (
                                /* --- EDIT MODE --- */
                                <div className="d-flex align-items-center">
                                    <div className="input-group input-group-sm" style={{ width: '130px' }}>
                                        <span className="input-group-text bg-white border-primary text-primary">
                                            Qty
                                        </span>
                                        <Form.Control
                                            type="number"
                                            className="border-primary text-center fw-bold"
                                            value={tempStock}
                                            onChange={(e) => setTempStock(e.target.value)}
                                            autoFocus
                                            min="0"
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* --- VIEW MODE --- */
                                <div
                                    className="d-flex align-items-center justify-content-between group"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => startEditing(v)} // Allow clicking the whole cell to edit
                                >
                                    <div className="d-flex align-items-center">
                                        <span className={`fs-5 fw-semibold ${v.stockQuantity === 0 ? 'text-danger' : 'text-dark'}`}>
                                            {v.stockQuantity}
                                        </span>
                                        <small className="ms-2 text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                                            Units
                                        </small>
                                    </div>

                                    {/* Subtle Edit Icon that appears on row hover (if you add a 'group' class) */}
                                    <PencilSquare
                                        size={14}
                                        className="text-primary opacity-50 hover-opacity-100 transition-all"
                                    />
                                </div>
                            )}
                        </td>
                        <td>
                            <Badge bg={v.stockQuantity > 0 ? "success" : "danger"}>
                                {v.stockQuantity > 0 ? "In Stock" : "Empty"}
                            </Badge>
                        </td>
                        <td>
                            {editingId === v.id ? (
                                <div className="d-flex gap-2">
                                    <Button variant="success" size="sm" onClick={() => handleUpdate(v.id)}>
                                        <CheckLg /> Update
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={cancelEditing}>
                                        <XCircle />
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(v.id)}>
                                    <Trash /> Delete
                                </Button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default AvailableVariantsTable;