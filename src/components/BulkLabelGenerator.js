import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import axios from 'axios';
import "../styles/BulkLabelGenerator.css";
import NavbarComponent from './NavbarComponent';
import CardComponent from './CardComponent';

const BulkLabelGenerator = () => {

    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [inventory, setInventory] = useState([]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8080/api/admin/products');
            setProducts(res.data);
            // FIX 1: Initialize inventory with products + a 'checked' property
            const initialInventory = res.data.map(p => ({
                ...p,
                variants: p.variants.map(v => ({ ...v, checked: false }))
            }));
            setInventory(initialInventory);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const generateBulkPDF = async () => {
        setLoading(true);
        try {
            // 1. Filter: Get only products that have checked variants
            // 2. Map: Inside those products, get only the variants that are checked
            const selectedInventory = inventory
                .map(product => ({
                    ...product,
                    variants: product.variants.filter(v => v.checked)
                }))
                .filter(product => product.variants.length > 0);

            if (selectedInventory.length === 0) {
                alert("Please select at least one variant to generate labels.");
                setLoading(false);
                return;
            }

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 10;
            const labelWidth = 60;
            const labelHeight = 45;
            const spacing = 5;
            const labelsPerRow = Math.floor((pageWidth - (margin * 2)) / (labelWidth + spacing));

            let currentX = margin;
            let currentY = margin;
            let count = 0;

            for (const product of selectedInventory) {
                for (const variant of product.variants) {
                    // 1. Data for QR
                    const qrJson = JSON.stringify({
                        pId: product.id,
                        vId: variant.id,
                        sku: `${product.brand.name.substring(0, 3)}-${variant.size}-${variant.color}`,
                        price: product.basePrice + (variant.additionalPrice || 0)
                    });

                    // 2. Generate QR
                    const qrDataUrl = await QRCode.toDataURL(qrJson, { margin: 1 });

                    // 3. Draw Label Design
                    doc.setDrawColor(220, 220, 220);
                    doc.roundedRect(currentX, currentY, labelWidth, labelHeight, 2, 2, 'S');

                    // 4. Brand & Name
                    doc.setFontSize(7);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(150, 150, 150);
                    doc.text(product.brand.name.toUpperCase(), currentX + 3, currentY + 6);

                    doc.setFontSize(9);
                    doc.setTextColor(0, 0, 0);
                    const splitName = doc.splitTextToSize(product.name, labelWidth - 25);
                    doc.text(splitName, currentX + 3, currentY + 11);

                    // 5. Variant Details
                    doc.setFontSize(8);
                    doc.setFont("helvetica", "normal");
                    doc.text(`Size: ${variant.size}`, currentX + 3, currentY + 22);
                    doc.text(`Color: ${variant.color}`, currentX + 3, currentY + 26);

                    // 6. Add QR Code
                    doc.addImage(qrDataUrl, 'PNG', currentX + labelWidth - 22, currentY + 18, 18, 18);

                    // 7. Add Price
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'bold');
                    doc.text(`INR ${product.basePrice + variant.additionalPrice}`, currentX + 2, currentY + 40);

                    // 8. Update Coordinates
                    count++;
                    if (count % labelsPerRow === 0) {
                        currentX = margin;
                        currentY += labelHeight + spacing;
                    } else {
                        currentX += labelWidth + spacing;
                    }

                    // 9. New Page Check
                    if (currentY + labelHeight > 280) {
                        doc.addPage();
                        currentY = margin;
                        currentX = margin;
                    }
                }
            }

            doc.save(`Inventory_Labels_${Date.now()}.pdf`);
        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert("Error generating PDF. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <NavbarComponent />
            <div className="inventory-container" style={containerStyle}>

                {/* TOP HEADER SECTION */}
                <div className="bulk-generator-header" style={headerStyle}>
                    <div className="text-section">
                        <h3 style={headingStyle}>Inventory Label Management</h3>
                        <p style={subheadingStyle}>Generate QR code sticker sheets for your stock.</p>
                    </div>

                    <button
                        className="bulk-gen-btn"
                        onClick={generateBulkPDF}
                        disabled={loading}
                        style={buttonStyle}
                    >
                        {loading ? "..." : "🚀 Generate Labels"}
                    </button>
                </div>

                {/* LIST OF CARDS SECTION */}
                <div className="product-grid" style={gridStyle}>
                    {inventory.map(item => (
                        <CardComponent
                            key={item.id}
                            product={item} // 'item' contains the 'checked' status from parent state
                            setInventory={setInventory}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

// --- CSS-in-JS Styles ---

const containerStyle = {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between', // Pushes text to left and button to right
    alignItems: 'flex-start',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee'
};

const headingStyle = {
    margin: 0,
    fontSize: '24px',
    color: '#333'
};

const subheadingStyle = {
    margin: '5px 0 0 0',
    color: '#666',
    fontSize: '14px'
};

const buttonStyle = {
    width: '180px', // Small fixed width
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    whiteSpace: 'nowrap' // Prevents text from wrapping inside the small button
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', // Responsive grid
    gap: '20px',
    marginTop: '20px'
};

export default BulkLabelGenerator;