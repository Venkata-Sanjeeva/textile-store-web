import axios from 'axios';
import React, { useEffect, useState } from 'react';

const CardComponent = ({ product, setInventory }) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    // FIX 2: Local variants state is fine for UI, but let's sync it correctly
    // We initialize from the product prop (which now comes from 'inventory')
    const variants = product.variants || [];

    const updateParent = (updatedVariants) => {
        setInventory(prev => prev.map(p =>
            p.id === product.id ? { ...p, variants: updatedVariants } : p
        ));
    };

    const handleMainCheckboxChange = (e) => {
        e.stopPropagation();
        const anySelected = variants.some(v => v.checked);
        const newValue = !anySelected;
        const updated = variants.map(v => ({ ...v, checked: newValue }));
        updateParent(updated);
    };

    const toggleItem = (id) => {
        const updated = variants.map(v =>
            v.id === id ? { ...v, checked: !v.checked } : v
        );
        updateParent(updated);
    };

    const toggleSelectAll = () => {
        const allSelected = variants.every(v => v.checked);
        const updated = variants.map(v => ({ ...v, checked: !allSelected }));
        updateParent(updated);
    };

    // Derived values for the UI
    const anySelected = variants.some(v => v.checked);
    const allSelected = variants.length > 0 && variants.every(v => v.checked);

    return (
        <div style={wrapperStyle}>
            <div onClick={() => setIsPopupOpen(true)} style={cardStyle}>
                <input
                    type="checkbox"
                    checked={anySelected}
                    onChange={handleMainCheckboxChange}
                    onClick={(e) => e.stopPropagation()}
                    style={checkboxStyle}
                />
                <div style={{ textAlign: 'center', padding: '0 10px' }}>
                    {/* NEW: BRAND NAME */}
                    <div style={brandStyle}>{product?.brand.name || "Generic"}</div>
                    <strong style={productNameStyle}>{product?.name || "Product Name"}</strong>
                    <p style={countStyle}>
                        {variants.filter(i => i.checked).length} / {variants.length} variants selected
                    </p>
                </div>
            </div>

            {/* 2. THE MODAL POPUP */}
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
                                        <th style={thStyle}>Color</th>
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
                                            {/* Parsing the label or using separate properties if available */}
                                            <td style={tdStyle}>{item.size || '-'}</td>
                                            <td style={tdStyle}>{item.color || '-'}</td>
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

// --- Updated Styles ---

const wrapperStyle = { padding: '10px' };

const cardStyle = {
    width: '240px', height: '140px', border: '1px solid #e0e0e0', borderRadius: '12px',
    position: 'relative', cursor: 'pointer', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    ":hover": { boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }
};

const brandStyle = {
    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px',
    color: '#999', marginBottom: '4px', fontWeight: 'bold'
};

const productNameStyle = { fontSize: '16px', color: '#333', display: 'block' };

const countStyle = { fontSize: '12px', color: '#007bff', marginTop: '8px', fontWeight: '500' };

const checkboxStyle = {
    position: 'absolute', top: '12px', left: '12px', cursor: 'pointer',
    width: '18px', height: '18px', accentColor: '#007bff'
};

const overlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
    alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(2px)'
};

const modalStyle = {
    backgroundColor: 'white', borderRadius: '12px', width: '320px',
    maxHeight: '80vh', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden'
};

const modalHeaderStyle = {
    padding: '16px 20px', borderBottom: '1px solid #eee', backgroundColor: '#fcfcfc'
};

const modalBodyStyle = { padding: '10px 20px', overflowY: 'auto' };
const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
    fontFamily: 'inherit'
};

const tableHeaderRowStyle = {
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #eee',
};

const thStyle = {
    textAlign: 'left',
    padding: '12px 8px',
    fontSize: '13px',
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase'
};

const thCheckboxStyle = {
    ...thStyle,
    width: '40px',
};

const tableRowStyle = {
    borderBottom: '1px solid #eee',
    transition: 'background 0.2s',
};

const tdStyle = {
    padding: '10px 8px',
    fontSize: '14px',
    color: '#444',
};

const tdCheckboxStyle = {
    ...tdStyle,
    textAlign: 'center',
};

const buttonStyle = {
    margin: '16px 20px 20px', padding: '10px', cursor: 'pointer',
    backgroundColor: '#007bff', color: 'white', border: 'none',
    borderRadius: '8px', fontWeight: 'bold', fontSize: '14px'
};

export default CardComponent;