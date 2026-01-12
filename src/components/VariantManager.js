import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import AvailableVariantsTable from './AvailableVariantsTable';
import NavbarComponent from './NavbarComponent';

const VariantManager = () => {
    // Note: productId in useParams() now refers to the 'unique_id' string from the URL
    const { productId } = useParams(); 
    const navigate = useNavigate();
    
    const [product, setProduct] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const [availableVariants, setAvailableVariants] = useState([]);
    const [newVariants, setNewVariants] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Updated to use the correct uniqueId-based endpoints
            const prodRes = await axios.get(`http://localhost:8080/api/admin/products/unique/${productId}`);
            
            // New endpoint mapping: /api/admin/variants/product/{uniqueId}
            const varRes = await axios.get(`http://localhost:8080/api/admin/variants/product/${productId}`);

            setProduct(prodRes.data);
            setAvailableVariants(varRes.data);
        } catch (err) {
            console.error("Error loading data", err);
            alert("Could not load product data. It may not exist.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) return;

        const user = JSON.parse(sessionStorage.getItem("token"));

        if (user?.role !== "ADMIN") {
            navigate("/login");
            return;
        }

        const password = prompt("Enter admin password:");
        if (password === user?.password) {
            setIsAuthenticated(true);
            fetchData();
        } else {
            alert("Incorrect password");
            navigate("/login");
        }
    }, [productId, isAuthenticated, navigate]);

    const addNewRow = () => {
        setNewVariants([...newVariants, {
            size: '',
            color: '',
            additionalPrice: 0,
            stockQuantity: 0,
            productUniqueId: productId // Linking using the unique_id string
        }]);
    };

    const handleNewVariantChange = (index, field, value) => {
        const updated = [...newVariants];
        // Ensure numbers are handled correctly
        if (field === 'additionalPrice' || field === 'stockQuantity') {
            updated[index][field] = value === '' ? 0 : parseFloat(value);
        } else {
            updated[index][field] = value;
        }
        setNewVariants(updated);
    };

    const handleSaveNewVariants = async () => {
        if (newVariants.length === 0) return;
        
        try {
            // Bulk create expects List<ProductVariantDTO>
            await axios.post(`http://localhost:8080/api/admin/variants/bulk-create`, newVariants);
            alert("New variants added successfully!");

            // Refresh existing list and clear form
            fetchData(); 
            setNewVariants([]);
        } catch (err) {
            console.error(err);
            alert("Error saving variants: " + (err.response?.data || err.message));
        }
    };

    if (!isAuthenticated || loading) {
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    }

    return (
        <>
            <NavbarComponent />
            <Container fluid className="mt-4 px-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Manage Variants for 
                        <Badge bg="info" className="ms-2">{product?.name}</Badge>
                    </h2>
                    <Badge bg="dark">SKU Group: {productId}</Badge>
                </div>
                
                <Row>
                    <Col md={3}>
                        <Card className="sticky-top shadow-sm" style={{ top: '20px' }}>
                            <Card.Img 
                                variant="top" 
                                src={`http://localhost:8080/product-images/${product?.imageUrl}`} 
                                style={{ height: '200px', objectFit: 'contain' }}
                            />
                            <Card.Body>
                                <h5 className="mb-1">{product?.name}</h5>
                                <div className="mb-2">
                                    <Badge bg="secondary" className="me-1">{product?.category?.name}</Badge>
                                    <Badge bg="outline-secondary">{product?.brand?.name}</Badge>
                                </div>
                                <p className="text-primary fw-bold mb-0">Base Price: ₹{product?.basePrice}</p>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={9}>
                        <div className="mb-5">
                            <h4 className="mb-3 text-muted">Existing Inventory</h4>
                            <Card className="shadow-sm border-0">
                                {/* Passing productUniqueId (the string) to the table */}
                                <AvailableVariantsTable 
                                    productId={productId} 
                                    availableVariants={availableVariants} 
                                    setAvailableVariants={setAvailableVariants} 
                                />
                            </Card>
                        </div>

                        <hr className="my-5" />

                        <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4>Add New Variants</h4>
                                <Button variant="outline-primary" size="sm" onClick={addNewRow}>
                                    <i className="bi bi-plus-lg"></i> Add New Row
                                </Button>
                            </div>

                            {newVariants.length > 0 ? (
                                <Card className="p-3 shadow-sm border-primary">
                                    <Table borderless size="sm" responsive>
                                        <thead>
                                            <tr className="text-muted small">
                                                <th style={{ width: '20%' }}>SIZE</th>
                                                <th style={{ width: '20%' }}>COLOR</th>
                                                <th style={{ width: '25%' }}>ADDITIONAL PRICE (₹)</th>
                                                <th style={{ width: '25%' }}>STOCK QTY</th>
                                                <th style={{ width: '10%' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {newVariants.map((v, index) => (
                                                <tr key={index} className="align-middle">
                                                    <td><Form.Control size="sm" placeholder="e.g. XL" onChange={e => handleNewVariantChange(index, 'size', e.target.value)} /></td>
                                                    <td><Form.Control size="sm" placeholder="e.g. Red" onChange={e => handleNewVariantChange(index, 'color', e.target.value)} /></td>
                                                    <td><Form.Control size="sm" type="number" placeholder="0.00" onChange={e => handleNewVariantChange(index, 'additionalPrice', e.target.value)} /></td>
                                                    <td><Form.Control size="sm" type="number" placeholder="10" onChange={e => handleNewVariantChange(index, 'stockQuantity', e.target.value)} /></td>
                                                    <td className="text-center">
                                                        <Button variant="link" className="text-danger p-0" onClick={() => setNewVariants(newVariants.filter((_, i) => i !== index))}>
                                                            <i className="bi bi-trash"></i>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    <div className="d-grid mt-3">
                                        <Button variant="success" onClick={handleSaveNewVariants}>
                                            Save All New Variants
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <div className="text-center p-5 border rounded bg-light border-dashed">
                                    <p className="mb-0 text-muted italic">No new variant rows added yet.</p>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default VariantManager;