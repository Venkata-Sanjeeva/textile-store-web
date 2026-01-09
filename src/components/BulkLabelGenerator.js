import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import axios from 'axios';
import "../styles/BulkLabelGenerator.css";
import NavbarComponent from './NavbarComponent';

const BulkLabelGenerator = () => {
    const [loading, setLoading] = useState(false);

    const generateBulkPDF = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8080/api/admin/products');
            const inventory = res.data;

            // 1. Safety Check: Is the inventory even an array?
            if (!inventory || !Array.isArray(inventory) || inventory.length === 0) {
                alert("No products found in the database.");
                setLoading(false);
                return;
            }

            // 2. Logic Check: Count total variants across all products
            const totalVariants = inventory.reduce((acc, product) => {
                return acc + (product.variants ? product.variants.length : 0);
            }, 0);

            // 3. Early Exit: If no variants exist, don't generate the PDF
            if (totalVariants === 0) {
                alert("Process cancelled: No variants found for any products.");
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
            const labelsPerRow = Math.floor((pageWidth - (margin * 2)) / labelWidth);

            let currentX = margin;
            let currentY = margin;
            let count = 0;

            for (const product of inventory) {
                for (const variant of product.variants) {
                    // 1. Create JSON Data for QR
                    const qrJson = JSON.stringify({
                        pId: product.id,
                        vId: variant.id,
                        sku: `${product.brand.name.substring(0, 3)}-${variant.size}-${variant.color}`,
                        price: product.basePrice + variant.additionalPrice
                    });

                    // 2. Generate QR Image
                    const qrDataUrl = await QRCode.toDataURL(qrJson, { margin: 1 });

                    // 3. Draw Label Border (Optional)
                    doc.setDrawColor(230, 230, 230);
                    doc.rect(currentX, currentY, labelWidth, labelHeight);

                    // 4. Add Text Content
                    doc.setFontSize(8);
                    doc.setFont(undefined, 'bold');
                    doc.text(product.brand.name.toUpperCase(), currentX + 2, currentY + 5);

                    doc.setFont(undefined, 'normal');
                    doc.setFontSize(9);
                    doc.text(product.name.substring(0, 25), currentX + 2, currentY + 10);

                    doc.setFontSize(7);
                    doc.text(`Size: ${variant.size} | Color: ${variant.color}`, currentX + 2, currentY + 14);

                    // 5. Add QR Code
                    doc.addImage(qrDataUrl, 'PNG', currentX + labelWidth - 22, currentY + 18, 20, 20);

                    // 6. Add Price
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'bold');
                    doc.text(`INR ${product.basePrice + variant.additionalPrice}`, currentX + 2, currentY + 40);

                    // 7. Update Coordinates for next label
                    count++;
                    if (count % labelsPerRow === 0) {
                        currentX = margin;
                        currentY += labelHeight + 5;
                    } else {
                        currentX += labelWidth + 5;
                    }

                    // 8. Check for New Page
                    if (currentY + labelHeight > 280) {
                        doc.addPage();
                        currentY = margin;
                        currentX = margin;
                    }
                }
            }

            doc.save(`Bulk_Product_Labels_${Date.now()}.pdf`);
        } catch (err) {
            console.error("Bulk PDF Error", err);
            alert("Failed to generate bulk labels");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <NavbarComponent />
            <div className="bulk-generator-card">
                <h3>Inventory Label Management</h3>
                <p>Generate QR code sticker sheets for your entire stock.</p>
                <button
                    className="bulk-gen-btn"
                    onClick={generateBulkPDF}
                    disabled={loading}
                >
                    {loading ? "Generating..." : "🚀 Generate All Product Labels"}
                </button>
            </div>
        </>
    );
};

export default BulkLabelGenerator;