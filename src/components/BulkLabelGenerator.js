import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import axios from 'axios';
import NavbarComponent from './NavbarComponent';
import CardComponent from './CardComponent';

const BulkLabelGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [inventory, setInventory] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8080/api/admin/products');
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

    useEffect(() => { fetchProducts(); }, []);

    // --- Search Logic ---
    const filteredInventory = inventory.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generateBulkPDF = async () => {
        setLoading(true);
        try {
            const selectedItems = inventory.flatMap(product => 
                product.variants
                    .filter(v => v.checked)
                    .map(v => ({ 
                        ...v, 
                        productName: product.name, 
                        brandName: product.brand.name, 
                        totalPrice: product.basePrice + v.additionalPrice 
                    }))
            );

            if (selectedItems.length === 0) {
                alert("Please select at least one variant.");
                setLoading(false);
                return;
            }

            const doc = new jsPDF({ unit: 'mm', format: 'a4' });
            const margin = 10;
            const labelW = 60;
            const labelH = 40;
            const gap = 5;
            const cols = 3;
            
            let x = margin;
            let y = margin;
            let colCount = 0;

            for (const item of selectedItems) {
                const qrDataUrl = await QRCode.toDataURL(item.variantUniqueId, { margin: 1 });

                doc.setDrawColor(200);
                doc.roundedRect(x, y, labelW, labelH, 2, 2, 'S');
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(item.brandName.toUpperCase(), x + 3, y + 7);
                doc.setFontSize(10);
                doc.setTextColor(0);
                const title = doc.splitTextToSize(item.productName, 35);
                doc.text(title, x + 3, y + 13);
                doc.setFontSize(8);
                doc.text(`Size: ${item.size}`, x + 3, y + 25);
                doc.text(`Color: ${item.color || 'N/A'}`, x + 3, y + 29);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text(`Rs. ${item.totalPrice}`, x + 3, y + 36);
                doc.addImage(qrDataUrl, 'PNG', x + 38, y + 15, 20, 20);
                doc.setFontSize(6);
                doc.setFont("helvetica", "normal");
                doc.text(item.variantUniqueId, x + 38, y + 37);

                colCount++;
                if (colCount >= cols) {
                    colCount = 0;
                    x = margin;
                    y += labelH + gap;
                } else {
                    x += labelW + gap;
                }

                if (y + labelH > 280) {
                    doc.addPage();
                    y = margin;
                    x = margin;
                    colCount = 0;
                }
            }
            doc.save(`Labels_${Date.now()}.pdf`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <NavbarComponent />
            <div className="container mt-4">
                {/* Header Section */}
                <div className="bg-white shadow-sm rounded p-4 mb-4">
                    <div className="row align-items-center">
                        <div className="col-md-4">
                            <h3 className="mb-0">Tag Generator</h3>
                            <p className="text-muted small mb-0">Select products for thermal stickers</p>
                        </div>
                        <div className="col-md-4">
                            <input 
                                type="text"
                                className="form-control"
                                placeholder="Search by product or brand..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4 text-end">
                            <button className="btn btn-primary w-100" onClick={generateBulkPDF} disabled={loading}>
                                {loading ? "Generating..." : "Print Selected Labels"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                {loading && inventory.length === 0 ? (
                    <div className="text-center mt-5">Loading Inventory...</div>
                ) : (
                    <div className="row g-4">
                        {filteredInventory.length > 0 ? (
                            filteredInventory.map(item => (
                                <div className="col-md-4 col-lg-3 d-flex justify-content-center" key={item.id}>
                                    <CardComponent product={item} setInventory={setInventory} />
                                </div>
                            ))
                        ) : (
                            <div className="text-center mt-5 text-muted">No products found matching "{searchTerm}"</div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default BulkLabelGenerator;