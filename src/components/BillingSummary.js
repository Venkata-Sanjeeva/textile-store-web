import React, { useEffect, useState } from 'react';
import NavbarComponent from './NavbarComponent';
import axios from 'axios';
import QRCode from 'qrcode'; // Add this import
import '../styles/BillingSummary.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const BillingSummary = () => {
    const [inventory, setInventory] = useState([]);
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");
    const [activeProduct, setActiveProduct] = useState(null);

    // Fetch Inventory from Backend
    useEffect(() => {
        axios.get('http://localhost:8080/api/admin/products')
            .then(res => setInventory(res.data))
            .catch(err => console.error("Error fetching inventory", err));
    }, []);

    const handleAddToCart = (product, variant) => {
        const itemPrice = product.basePrice + variant.additionalPrice;
        const cartKey = `v-${variant.id}`;
        const exists = cart.find(x => x.cartKey === cartKey);

        if (exists) {
            if (exists.qty < variant.stockQuantity) {
                setCart(cart.map(x => x.cartKey === cartKey ? { ...x, qty: x.qty + 1 } : x));
            } else {
                alert("Maximum stock reached for this variant.");
            }
        } else {
            setCart([...cart, {
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

    const updateQty = (cartKey, delta) => {
        setCart(cart.map(item => {
            if (item.cartKey === cartKey) {
                const newQty = item.qty + delta;
                if (newQty > 0 && newQty <= item.maxStock) {
                    return { ...item, qty: newQty };
                } else if (newQty > item.maxStock) {
                    alert(`Only ${item.maxStock} items available in stock.`);
                }
            }
            return item;
        }));
    };

    const removeFromCart = (cartKey) => setCart(cart.filter(x => x.cartKey !== cartKey));

    const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
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
        doc.text("CLOTHING STORE", pageWidth / 2, 10, { align: "center" });

        doc.setFont("courier", "normal");
        doc.setFontSize(8);
        doc.text("123 Fashion Street, Boutique City", pageWidth / 2, 15, { align: "center" });
        doc.text("GSTIN: 27AAAAA0000A1Z5", pageWidth / 2, 19, { align: "center" }); // Mock GST
        doc.text("-".repeat(45), pageWidth / 2, 23, { align: "center" });

        doc.setFontSize(7);
        doc.text(`Date: ${date}`, margin, 28);
        doc.text("-".repeat(45), pageWidth / 2, 32, { align: "center" });

        // 3. Compact Table Generation
        const tableRows = cart.map(item => [
            `${item.brand} ${item.name}\nSize: ${item.size}`,
            `${item.qty}`,
            `${(item.price * item.qty).toFixed(2)}`
        ]);

        autoTable(doc, {
            head: [["Item", "Qty", "Amt"]],
            body: tableRows,
            startY: 35,
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
                quantity: item.qty
            }));

            await axios.put('http://localhost:8080/api/admin/billing', billingProducts);

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
        doc.text("Thank you for shopping!", pageWidth / 2, finalY + 5, { align: "center" });
        doc.text("No exchange without bill.", pageWidth / 2, finalY + 9, { align: "center" });

        // Save
        doc.save(`${customerName}_${Date.now()}_Receipt.pdf`);
        setCart([]);
        alert("Receipt generated!");
        window.location.reload();
    };

    return (
        <div className="light-theme-wrapper">
            <NavbarComponent />
            <div className="pos-container">

                {/* LEFT: Product Grid */}
                <div className="inventory-section">
                    <div className="search-header">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

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
                </div>

                {/* MODAL: Premium Variant Picker */}
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
                                            <div className="v-price-display">
                                                ₹ {activeProduct.basePrice + v.additionalPrice}
                                            </div>
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

                {/* RIGHT: Billing Sidebar */}
                <div className="billing-sidebar">
                    <div className="sidebar-header">Current Order</div>

                    <div className="cart-list">
                        {cart.length === 0 ? (
                            <div className="empty-cart-view">
                                <div className="empty-icon">🛒</div>
                                <p>No items in cart</p>
                                <span>Select a product to start</span>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.cartKey} className="cart-item-row">
                                    <div className="cart-item-left">
                                        <span className="cart-item-name">{item.name}</span>
                                        <span className="cart-item-meta">{item.color} • {item.size}</span>
                                    </div>
                                    <div className="cart-item-right">
                                        <div className="qty-controls">
                                            <button onClick={() => updateQty(item.cartKey, -1)}>−</button>
                                            <span>{item.qty}</span>
                                            <button onClick={() => updateQty(item.cartKey, 1)}>+</button>
                                        </div>
                                        <div className="cart-item-price">₹{item.price * item.qty}</div>
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