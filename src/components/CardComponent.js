import axios from 'axios';
import React, { useEffect, useState } from 'react';

const CardComponent = ({ product, setInventory }) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    
    // 1. EXTRACT DATA
    const variants = product.variants || [];

    // 2. DERIVE VALUES (Declare these before they are used in styles)
    const anySelected = variants.some(v => v.checked);
    const allSelected = variants.length > 0 && variants.every(v => v.checked);
    
    // Check if any variant is low on stock (less than 5 units)
    const isLowStock = variants.some(v => v.stockQuantity > 0 && v.stockQuantity < 5);
    const isOutOfStock = variants.every(v => v.stockQuantity === 0);

    // 3. DEFINE DYNAMIC STYLES
    const dynamicCardStyle = {
        width: '240px', 
        height: '140px', 
        borderRadius: '12px',
        position: 'relative', 
        cursor: 'pointer', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: anySelected ? '#f0f7ff' : '#fff',
        transition: 'all 0.2s ease',
        boxShadow: anySelected ? '0 4px 12px rgba(0,123,255,0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
        border: anySelected ? '2px solid #007bff' : '1px solid #e0e0e0',
    };

    // 4. HELPER FUNCTIONS
    const updateParent = (updatedVariants) => {
        setInventory(prev => prev.map(p =>
            p.id === product.id ? { ...p, variants: updatedVariants } : p
        ));
    };

    const handleMainCheckboxChange = (e) => {
        e.stopPropagation();
        // If all are already selected, deselect all. Otherwise, select all.
        const updated = variants.map(v => ({ ...v, checked: !allSelected }));
        updateParent(updated);
    };

    const toggleItem = (id) => {
        const updated = variants.map(v =>
            v.id === id ? { ...v, checked: !v.checked } : v
        );
        updateParent(updated);
    };

    const toggleSelectAll = () => {
        const updated = variants.map(v => ({ ...v, checked: !allSelected }));
        updateParent(updated);
    };

    return (
        <div style={wrapperStyle}>
            {/* PRODUCT CARD */}
            <div onClick={() => setIsPopupOpen(true)} style={dynamicCardStyle} className="inventory-card">
                
                {/* STATUS BADGES */}
                <div style={badgeContainerStyle}>
                    {isOutOfStock ? (
                        <span style={{...badgeStyle, backgroundColor: '#ffebee', color: '#c62828'}}>Out of Stock</span>
                    ) : isLowStock && (
                        <span style={{...badgeStyle, backgroundColor: '#fff3cd', color: '#856404'}}>⚠️ Low Stock</span>
                    )}
                </div>

                <input
                    type="checkbox"
                    checked={anySelected}
                    onChange={handleMainCheckboxChange}
                    onClick={(e) => e.stopPropagation()}
                    style={checkboxStyle}
                />
                
                <div style={{ textAlign: 'center', padding: '0 10px' }}>
                    <div style={brandStyle}>{product?.brand?.name || "Generic"}</div>
                    <strong style={productNameStyle}>{product?.name || "Product Name"}</strong>
                    <p style={countStyle}>
                        {variants.filter(i => i.checked).length} / {variants.length} selected
                    </p>
                </div>
            </div>

            {/* VARIANT SELECTION MODAL */}
            {isPopupOpen && (
                <div style={overlayStyle} onClick={() => setIsPopupOpen(false)}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={modalHeaderStyle}>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>Select Variants</h3>
                            <span style={{ fontSize: '12px', color: '#666' }}>{product?.name}</span>
                        </div>

                        <div style={modalBodyStyle}>
                            <table style={tableStyle}>
                                <thead>
                                    <tr style={tableHeaderRowStyle}>
                                        <th style={thStyle}>Size</th>
                                        <th style={thStyle}>Stock</th>
                                        <th style={thCheckboxStyle}>
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {variants.map(item => (
                                        <tr key={item.id} style={tableRowStyle}>
                                            <td style={tdStyle}>{item.size} {item.color ? `(${item.color})` : ''}</td>
                                            <td style={{...tdStyle, color: item.stockQuantity < 5 ? '#dc3545' : '#28a745'}}>
                                                {item.stockQuantity}
                                            </td>
                                            <td style={tdCheckboxStyle}>
                                                <input
                                                    type="checkbox"
                                                    checked={item.checked}
                                                    onChange={() => toggleItem(item.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => setIsPopupOpen(false)} style={buttonStyle}>
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLES ---

const wrapperStyle = { padding: '10px' };

const badgeContainerStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
};

const badgeStyle = {
    fontSize: '9px',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
};

const brandStyle = {
    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px',
    color: '#999', marginBottom: '4px', fontWeight: 'bold'
};

const productNameStyle = { fontSize: '15px', color: '#333', display: 'block', lineHeight: '1.2' };

const countStyle = { fontSize: '12px', color: '#007bff', marginTop: '8px', fontWeight: '500' };

const checkboxStyle = {
    position: 'absolute', top: '12px', left: '12px', cursor: 'pointer',
    width: '18px', height: '18px', accentColor: '#007bff'
};

const overlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center',
    alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(3px)'
};

const modalStyle = {
    backgroundColor: 'white', borderRadius: '12px', width: '340px',
    maxHeight: '80vh', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden'
};

const modalHeaderStyle = { padding: '16px 20px', borderBottom: '1px solid #eee' };
const modalBodyStyle = { padding: '10px 20px', overflowY: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const tableHeaderRowStyle = { backgroundColor: '#f8f9fa' };
const thStyle = { textAlign: 'left', padding: '10px 8px', fontSize: '12px', color: '#666' };
const thCheckboxStyle = { ...thStyle, textAlign: 'center' };
const tableRowStyle = { borderBottom: '1px solid #eee' };
const tdStyle = { padding: '10px 8px', fontSize: '14px' };
const tdCheckboxStyle = { textAlign: 'center' };

const buttonStyle = {
    margin: '16px 20px 20px', padding: '12px', cursor: 'pointer',
    backgroundColor: '#007bff', color: 'white', border: 'none',
    borderRadius: '8px', fontWeight: 'bold'
};

export default CardComponent;