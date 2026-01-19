import React, { useEffect, useState, useCallback } from 'react';
import NavbarComponent from './NavbarComponent';
import axios from 'axios';
import QRCode from 'qrcode';
import '../styles/BillingSummary.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Html5QrcodeScanner } from 'html5-qrcode';

const BACKEND_API_URL = process.env.REACT_APP_API_URL;

const BillingSummary = () => {
    const [inventory, setInventory] = useState([]);
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");
    const [activeProduct, setActiveProduct] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [discountOfVariants, setDiscountOfVariants] = useState({});
    const [inventoryLoading, setInventoryLoading] = useState(true);

    // Fetch Inventory
    useEffect(() => {
        setInventoryLoading(true);
        axios.get(`${BACKEND_API_URL}/admin/products`)
            .then(res => setInventory(res.data))
            .catch(err => console.error("Error fetching inventory", err))
            .finally(() => setInventoryLoading(false));
    }, []);

    useEffect(() => {
        if (showCamera) {
            const scanner = new Html5QrcodeScanner("reader", {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            });

            scanner.render((decodedText) => {
                processScan(decodedText); // Reuses your existing logic!
                setShowCamera(false);
                scanner.clear();
            }, (error) => {
                console.warn(error);
            });

            return () => scanner.clear();
        }
    }, [showCamera]);

    const processScan = (code) => {
        // Look for the variant across all products using variantUniqueId
        let foundProduct = null;
        let foundVariant = null;

        for (const prod of inventory) {
            const variant = prod.variants.find(v => v.variantUniqueId === code);
            if (variant) {
                foundProduct = prod;
                foundVariant = variant;
                break;
            }
        }

        if (foundProduct && foundVariant) {
            handleAddToCart(foundProduct, foundVariant);
            // Optional: Play a "beep" sound here
        } else {
            console.warn("No product found for code:", code);
        }
    };

    const handleAddToCart = (product, variant, discount = 0) => {
        const itemPrice = product.basePrice + variant.additionalPrice;
        const cartKey = variant.variantUniqueId;
        setDiscountOfVariants(prev => ({ ...prev, [cartKey]: discount || 0 }));
        const exists = cart.find(x => x.cartKey === cartKey);

        if (exists) {
            if (exists.qty < variant.stockQuantity) {
                setCart(prev => prev.map(x => x.cartKey === cartKey ? { ...x, qty: x.qty + 1 } : x));
            } else {
                alert("Maximum stock reached.");
            }
        } else {
            setCart(prev => [...prev, {
                cartKey,
                productId: product.id,
                variantId: variant.id,
                name: product.name,
                brand: product.brand.name,
                size: variant.size,
                color: variant.color,
                price: itemPrice,
                qty: 1,
                maxStock: variant.stockQuantity
            }]);
        }
        setActiveProduct(null);
    };

    // ... (Keep updateQty, removeFromCart, and generateReceipt exactly as they were)
    const updateQty = (cartKey, delta) => {
        setCart(cart.map(item => {
            if (item.cartKey === cartKey) {
                const newQty = item.qty + delta;
                if (newQty > 0 && newQty <= item.maxStock) {
                    return { ...item, qty: newQty };
                }
            }
            return item;
        }));
    };

    const updateDiscount = (cartKey, discount = 0) => {
        setDiscountOfVariants(prev => ({ ...prev, [cartKey]: discount }));
    }

    const removeFromCart = (cartKey) => {
        setCart(cart.filter(x => x.cartKey !== cartKey))
        setDiscountOfVariants(prev => {
            const updated = { ...prev };
            delete updated[cartKey];
            return updated;
        });
    };

    const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0) - cart.reduce((a, c) => a + (c.price * (discountOfVariants[c.cartKey] || 0) / 100) * c.qty, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const generateReceipt = async () => {
        // 1. Setup for Thermal Printer Format (80mm width)
        // We use a long height (e.g., 200mm) and jsPDF will clip it, 
        // or we can calculate it based on cart length.
        const receiptWidth = 80;
        const receiptHeight = 150 + (cart.length * 15); // Dynamic height
        const doc = new jsPDF({
            unit: "mm",
            format: [receiptWidth, receiptHeight]
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 5;
        const date = new Date().toLocaleString();

        // 2. Header (Store Branding)
        doc.setFont("courier", "bold");
        doc.setFontSize(14);
        doc.text("ICON MEN'S STORE", pageWidth / 2, 10, { align: "center" });

        doc.setFont("courier", "normal");
        doc.setFontSize(8);

        // Split the address into two lines for better readability on narrow paper
        doc.text("Room No:2, Theru Road,", pageWidth / 2, 15, { align: "center" });
        doc.text("Opp. PNB, Jammalamadugu", pageWidth / 2, 19, { align: "center" });

        doc.text("GSTIN: 27AAAAA0000A1Z5", pageWidth / 2, 23, { align: "center" });
        doc.text("-".repeat(45), pageWidth / 2, 27, { align: "center" });

        // Adjusted the start of the date to 32 to accommodate the extra line
        doc.setFontSize(7);
        doc.text(`Date: ${date}`, margin, 32);
        doc.text("-".repeat(45), pageWidth / 2, 36, { align: "center" });

        // 3. Compact Table Generation
        const tableRows = cart.map(item => [
            `${item.brand} ${item.name}\nSize: ${item.size}\nColour: ${item.color}\nOriginal: Rs.${item.price}\nDisc: ${discountOfVariants[item.cartKey] || 0}%`,
            `${item.qty}`,
            `${((item.price * (1 - (discountOfVariants[item.cartKey] || 0) / 100)) * item.qty).toFixed(2)}`
        ]);

        autoTable(doc, {
            head: [["Item", "Qty", "Amt"]],
            body: tableRows,
            startY: 40,
            theme: 'plain', // Minimalist theme for thermal look
            styles: { font: "courier", fontSize: 7, cellPadding: 1 },
            headStyles: { fontStyle: 'bold', textColor: [0, 0, 0] },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { halign: 'center' },
                2: { halign: 'right' }
            },
            margin: { left: margin, right: margin }
        });

        // 4. Totals Section
        let finalY = doc.lastAutoTable.finalY + 5;
        const rightMargin = pageWidth - margin;

        doc.text("-".repeat(45), pageWidth / 2, finalY, { align: "center" });
        finalY += 5;

        doc.setFontSize(8);
        doc.text(`Subtotal:`, margin, finalY);
        doc.text(`${subtotal.toFixed(2)}`, rightMargin, finalY, { align: "right" });

        finalY += 5;
        doc.text(`GST (18%):`, margin, finalY);
        doc.text(`${tax.toFixed(2)}`, rightMargin, finalY, { align: "right" });

        finalY += 7;
        doc.setFont("courier", "bold");
        doc.setFontSize(10);
        doc.text(`GRAND TOTAL:`, margin, finalY);
        doc.text(`INR ${total.toFixed(2)}`, rightMargin, finalY, { align: "right" });

        // 5. Backend Update & QR
        const customerName = prompt("Enter customer name:") || 'Guest';
        try {
            const billingProducts = cart.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                variantUniqueId: item.cartKey,
                quantity: item.qty,
                totalPrice: (item.price * (1 - (discountOfVariants[item.cartKey] || 0) / 100)) * item.qty
            }));

            await axios.put(`${BACKEND_API_URL}/admin/billing`, billingProducts)
                .then(res => console.log("Billing updated", res.data))
                .catch(err => console.error("Error updating billing", err));

            const qrData = `Order:${Date.now()}|Total:${total.toFixed(2)}`;
            const qrDataUrl = await QRCode.toDataURL(qrData);

            // Center QR Code
            const qrSize = 25;
            doc.addImage(qrDataUrl, 'PNG', (pageWidth / 2) - (qrSize / 2), finalY + 5, qrSize, qrSize);
            finalY += (qrSize + 10);
        } catch (err) {
            console.error("Error", err);
        }

        // 6. Footer
        doc.setFont("courier", "italic");
        doc.setFontSize(8);
        doc.text("Thank you for shopping at ICON!", pageWidth / 2, finalY + 5, { align: "center" });
        doc.text("No exchange without bill.", pageWidth / 2, finalY + 9, { align: "center" });

        // Save
        // 6. SAFE DOWNLOAD (Chrome Optimized)
        const pdfBlob = doc.output("blob");
        const blobUrl = URL.createObjectURL(pdfBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = blobUrl;
        downloadLink.download = `${customerName}_Receipt.pdf`;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Clean up memory
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

        setCart([]);
        alert("Receipt generated!");
        window.location.reload();
    };

    return (
        <div className="light-theme-wrapper">
            <NavbarComponent />

            {showCamera && (
                <div className="modal-overlay">
                    <div className="variant-modal" style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <div className="header-text">
                                <h2>Scan Barcode</h2>
                                <span className="brand-label">Camera Active</span>
                            </div>
                            <button className="icon-close" onClick={() => setShowCamera(false)}>&times;</button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <div className="scanner-viewport">
                                <div className="scanning-line"></div>
                                <div id="reader"></div>
                            </div>

                            <div className="camera-modal-footer">
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    Center the barcode within the camera view to scan automatically.
                                </p>
                                <button className="checkout-action-btn"
                                    style={{ background: 'var(--danger)' }}
                                    onClick={() => setShowCamera(false)}>
                                    Close Scanner
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="pos-container">
                {/* LEFT: Product Grid (Same Styles) */}
                <div className="inventory-section">
                    <div className="search-header">
                        <input
                            type="text"
                            placeholder="Search or Scan Barcode..."
                            className="search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button onClick={() => setShowCamera(true)} className="camera-btn">
                            📷 Use Camera Scanner
                        </button>
                    </div>

                    {inventoryLoading ? (
                        <div className="loading-indicator">Loading inventory...</div>
                    ) : (
                        <div className="product-grid">
                            {inventory
                                .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
                                .map(product => (
                                    <div key={product.id} className="product-card" onClick={() => setActiveProduct(product)}>
                                        <span className="brand-tag">{product.brand.name}</span>
                                        <h3>{product.name}</h3>
                                        <p className="price-label">Starts at ₹{product.basePrice}</p>
                                        <span className="variant-count">{product.variants.length} Variants</span>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* MODAL: Same Styles */}
                {activeProduct && (
                    <div className="modal-overlay" onClick={() => setActiveProduct(null)}>
                        <div className="variant-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="header-text">
                                    <h2>{activeProduct.name}</h2>
                                    <span className="brand-label">{activeProduct.brand.name}</span>
                                </div>
                                <button className="icon-close" onClick={() => setActiveProduct(null)}>&times;</button>
                            </div>

                            <div className="variant-grid-container">
                                <div className="grid-header">
                                    <span>Color / Size</span>
                                    <span>Stock Status</span>
                                    <span>Unit Price</span>
                                </div>
                                <div className="variant-scroll-area">
                                    {activeProduct.variants.map(v => (
                                        <button
                                            key={v.id}
                                            className="variant-selection-row"
                                            disabled={v.stockQuantity === 0}
                                            onClick={() => handleAddToCart(activeProduct, v)}
                                        >
                                            <div className="v-capsules">
                                                <span className="color-pill">{v.color}</span>
                                                <span className="size-pill">{v.size}</span>
                                            </div>
                                            <div className="v-stock-status">
                                                <span className={`status-dot ${v.stockQuantity < 5 ? 'low' : 'good'}`}></span>
                                                {v.stockQuantity} Available
                                            </div>
                                            <div className="v-price-display">₹ {activeProduct.basePrice + v.additionalPrice}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="cancel-text-btn" onClick={() => setActiveProduct(null)}>Cancel Selection</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* RIGHT: Sidebar (Same Styles) */}
                <div className="billing-sidebar">
                    <div className="sidebar-header">Current Order</div>
                    <div className="cart-list">
                        {cart.length === 0 ? (
                            <div className="empty-cart-view">
                                <div className="empty-icon">🛒</div>
                                <p>No items in cart</p>
                                <span>Scan a barcode or click a product</span>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.cartKey} className="cart-item-row">
                                    <div className="cart-item-left">
                                        <span className="cart-item-name">{item.name}</span>
                                        <span className="cart-item-meta">{item.color} • {item.size}</span>
                                        <br />
                                        <span className="cart-item-meta" >Rs.
                                            <span style={{ textDecoration: "line-through" }}>{item.price}</span>
                                        </span>
                                    </div>

                                    <div className="cart-item-middle">
                                        <div className="discount-control">
                                            <span className="cart-item-discount">Discount %</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="99"
                                                className="discount-input"
                                                value={discountOfVariants[item.cartKey] || ""}
                                                onChange={e => updateDiscount(item.cartKey, Number(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="cart-item-right">
                                        <div className="qty-controls">
                                            <button onClick={() => updateQty(item.cartKey, -1)}>−</button>
                                            <span>{item.qty}</span>
                                            <button onClick={() => updateQty(item.cartKey, 1)}>+</button>
                                        </div>
                                        <div className="cart-item-price">₹{((item.price * (1 - (discountOfVariants[item.cartKey] || 0) / 100)) * item.qty).toFixed(2)}</div>
                                        <button className="remove-btn" onClick={() => removeFromCart(item.cartKey)}>×</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="billing-footer">
                        <div className="bill-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                        <div className="bill-row"><span>Tax (GST 18%)</span><span>₹{tax.toFixed(2)}</span></div>
                        <div className="bill-total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                        <button className="checkout-action-btn" disabled={cart.length === 0} onClick={generateReceipt}>
                            FINALIZE & PRINT RECEIPT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingSummary;