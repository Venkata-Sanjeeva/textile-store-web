import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import it as a function
import axios from 'axios';
import {
    Container, Table, Card,
    Button, Pagination, Spinner, Row, Col, Modal
} from 'react-bootstrap';
// Mixing Lucide for UI and Bootstrap Icons to match your Navbar
import { BoxSeam, PersonCircle, Telephone, Calendar3, BagCheck, Eye, Printer } from 'react-bootstrap-icons';
import NavbarComponent from './NavbarComponent';

const BACKEND_API_URL = process.env.REACT_APP_API_URL;

const PurchaseHistory = () => {
    const [purchases, setPurchases] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [invoiceLoading, setInvoiceLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Optimized Fetch
    const fetchPurchases = useCallback(async (page, search = "") => {
        setLoading(true);
        try {
            const url = `${BACKEND_API_URL}/admin/purchases/all?page=${page}&size=5&search=${search}`;
            const res = await axios.get(url);
            setPurchases(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect for handling Search & Pagination
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPurchases(currentPage, "");
        }, 400); // 400ms debounce to prevent API spamming

        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, fetchPurchases]);

    const generateInvoice = (order) => {
        // 1. Immediately show the loading state
        setInvoiceLoading(true);

        // 2. Wrap the logic in a timeout (even 0ms works) to let React render the spinner
        setTimeout(() => {
            try {
                const doc = new jsPDF();
                const tableColumn = ["Product", "Variant", "Qty", "Price", "Discount", "Total"];
                const tableRows = [];

                order.items.forEach(item => {
                    const itemData = [
                        item.productName,
                        item.productVariant,
                        item.quantity,
                        `Rs. ${item.unitPriceAtPurchase.toFixed(2)}`,
                        item.discountApplied + '%',
                        `Rs. ${((item.unitPriceAtPurchase * (1 - item.discountApplied / 100)) * item.quantity).toFixed(2)}`,
                    ];
                    tableRows.push(itemData);
                });

                // Branding & Header
                doc.setFontSize(20);
                doc.setTextColor(40);
                doc.text("ICON MEN'S STORE", 14, 22);
                doc.setFontSize(10);
                doc.text("Official Purchase Invoice", 14, 28);

                // Meta Info
                doc.text(`Invoice No: ${order.purchaseUniqueId}`, 150, 22);
                doc.text(`Date: ${new Date(order.purchaseDate).toLocaleDateString()}`, 150, 28);

                doc.setDrawColor(200);
                doc.line(14, 35, 196, 35);

                doc.setFont("helvetica", "bold");
                doc.text("Billed To:", 14, 45);
                doc.setFont("helvetica", "normal");
                doc.text(`${order.customerName}`, 14, 50);
                doc.text(`Phone: ${order.customerPhone || 'N/A'}`, 14, 55);

                // Table Generation
                autoTable(doc, {
                    startY: 65,
                    head: [tableColumn],
                    body: tableRows,
                    theme: 'striped',
                    headStyles: { fillColor: [13, 110, 253] },
                });

                // Summary
                const finalY = doc.lastAutoTable.finalY + 10;
                doc.text(`Subtotal: Rs. ${order.subtotal.toFixed(2)}`, 140, finalY);
                doc.text(`Tax (GST): Rs. ${order.tax.toFixed(2)}`, 140, finalY + 7);
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`Grand Total: Rs. ${order.totalAmount.toFixed(2)}`, 140, finalY + 15);

                // Footer
                doc.setFontSize(8);
                doc.setFont("helvetica", "italic");
                doc.text("Thank you for shopping with us!", 105, finalY + 30, { align: 'center' });

                // 3. Save the file
                doc.save(`invoice_${order.purchaseUniqueId}.pdf`);
            } catch (error) {
                console.error("PDF Generation Error:", error);
            } finally {
                // 4. Turn off loading state after the PDF is handed to the browser
                setInvoiceLoading(false);
            }
        }, 100);
    };

    return (
        <div className="bg-light min-vh-100">
            <NavbarComponent />

            <Container py={4} className="mt-4">
                {/* Header Section - Matches Navbar Style */}
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <h2 className="fw-bold text-dark mb-1">
                            <BagCheck className="text-primary me-2" />
                            Purchase History
                        </h2>
                        <p className="text-muted small mb-0">Manage and review all customer transactions</p>
                    </div>
                </div>

                {/* Table Card - Clean & Flat Style */}
                <Card className="border-0 shadow-sm overflow-hidden">
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" size="lg" />
                                <p className="mt-3 text-muted fw-bold">Syncing Records...</p>
                            </div>
                        ) : (
                            <Table hover responsive className="mb-0 custom-table">
                                <thead className="bg-white border-bottom">
                                    <tr className="text-muted small text-uppercase fw-bold">
                                        <th className="ps-4 py-3">Purchase Date</th>
                                        <th>Purchase ID</th>
                                        <th>Customer</th>
                                        <th className="text-end">Amount</th>
                                        <th className="text-center pe-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchases.map((p) => (
                                        <tr key={p.id} className="align-middle">
                                            <td className="ps-4">
                                                <div className="fw-bold text-dark">{new Date(p.purchaseDate).toLocaleDateString('en-IN')}</div>
                                                <div className="small text-muted">{new Date(p.purchaseDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td>
                                                <span className="font-monospace text-primary fw-bold">#{p.purchaseUniqueId}</span>
                                            </td>
                                            <td>
                                                <div className="fw-semibold">{p.customerName}</div>
                                                <div className="small text-muted">{p.customerPhone}</div>
                                            </td>
                                            <td className="text-end fw-bold fs-6">
                                                ₹{p.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-center pe-4">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="rounded-pill px-3"
                                                    onClick={() => { setSelectedOrder(p); setShowModal(true); }}
                                                >
                                                    <Eye className="me-1" /> View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>

                    {/* Pagination - Matching Primary Theme */}
                    {!loading && totalPages > 1 && (
                        <div className="d-flex justify-content-center py-3 bg-white border-top">
                            <Pagination className="mb-0">
                                <Pagination.Prev disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} />
                                {[...Array(totalPages)].map((_, i) => (
                                    <Pagination.Item key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} />
                            </Pagination>
                        </div>
                    )}
                </Card>
            </Container>

            {/* Redesigned Modal - High Professionalism */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold"><BoxSeam className="me-2 text-primary" /> Invoice Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4">
                    {selectedOrder && (
                        <>
                            <Row className="mb-4 g-3">
                                <Col md={6}>
                                    <div className="p-3 border rounded bg-white h-100">
                                        <p className="text-muted small text-uppercase fw-bold mb-2">Customer Info</p>
                                        <h5 className="mb-1 fw-bold text-primary"><PersonCircle className="me-2" />{selectedOrder.customerName}</h5>
                                        <p className="text-muted mb-0"><Telephone className="me-2" />{selectedOrder.customerPhone || 'N/A'}</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 border rounded bg-white h-100 text-md-end">
                                        <p className="text-muted small text-uppercase fw-bold mb-2">Reference</p>
                                        <h5 className="mb-1 fw-bold">#{selectedOrder.purchaseUniqueId}</h5>
                                        <p className="text-muted mb-0"><Calendar3 className="me-2" />{new Date(selectedOrder.purchaseDate).toLocaleString()}</p>
                                    </div>
                                </Col>
                            </Row>

                            <Table responsive className="mt-3">
                                <thead className="bg-light">
                                    <tr className="small text-uppercase">
                                        <th>Product</th>
                                        <th className="text-center">Qty</th>
                                        <th className="text-end">Price</th>
                                        <th className="text-end">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map((item, idx) => (
                                        <tr key={idx} className="align-middle">
                                            <td>
                                                <div className="fw-bold">{item.productName}</div>
                                                <div className="small text-muted">{item.productVariant}</div>
                                            </td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td className="text-end text-muted">₹{item.unitPriceAtPurchase}</td>
                                            <td className="text-end fw-bold">₹{((item.unitPriceAtPurchase * (1 - item.discountApplied / 100)) * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <div className="d-flex justify-content-end mt-4">
                                <div className="text-end" style={{ width: '250px' }}>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted">Subtotal</span>
                                        <span className="fw-bold">₹{selectedOrder.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="text-muted">Tax (GST)</span>
                                        <span className="fw-bold">₹{selectedOrder.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between border-top pt-3">
                                        <h5 className="fw-bold">Total</h5>
                                        <h4 className="fw-bold text-primary">₹{selectedOrder.totalAmount.toFixed(2)}</h4>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pb-4">
                    <Button variant="light" className="px-4 rounded-pill" onClick={() => setShowModal(false)}>Close</Button>
                    <Button
                        variant="primary"
                        className="px-4 rounded-pill shadow-sm"
                        onClick={() => generateInvoice(selectedOrder)} // Link here
                    >
                        {invoiceLoading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Printer className="me-2" /> Download Invoice
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PurchaseHistory;