import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AvailableVariantsTable from './AvailableVariantsTable';
import NavbarComponent from './NavbarComponent';

const VariantManager = () => {
    if (!JSON.parse(sessionStorage.getItem("token")).role === "ADMIN") {
        // Redirect to login or show an error
        window.location.href = "/login";
    }
    const { productId } = useParams();
    const [product, setProduct] = useState(null);

    // Part 1: Existing data from database
    const [availableVariants, setAvailableVariants] = useState([]);

    // Part 2: Form state for adding new rows
    const [newVariants, setNewVariants] = useState([]);

    const fetchData = async () => {
        try {
            const prodRes = await axios.get(`http://localhost:8080/api/admin/products/${productId}`);
            const varRes = await axios.get(`http://localhost:8080/api/admin/variants/${productId}`);

            setProduct(prodRes.data);
            setAvailableVariants(varRes.data);
        } catch (err) {
            console.error("Error loading data", err);
        }
    };
    useEffect(() => {
        // Fetch product and its existing variants
        fetchData();
    }, [productId]);

    // React: Change the structure so 'productId' is a top-level field in the object
    const addNewRow = () => {
        setNewVariants([...newVariants, {
            size: '',
            color: '',
            additionalPrice: 0,
            stockQuantity: 0,
            productId: productId // Flat structure
        }]);
    };

    const handleNewVariantChange = (index, field, value) => {
        const updated = [...newVariants];
        updated[index][field] = value;
        setNewVariants(updated);
    };

    const handleSaveNewVariants = async () => {
        if (newVariants.some(v => !v['productId'])) {
            alert("Product ID is missing!");
            return;
        }
        try {
            console.log(newVariants);

            await axios.post(`http://localhost:8080/api/admin/variants/bulk-create`, newVariants);
            alert("New variants added!");

            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <NavbarComponent />
            <Container fluid className="mt-4">
                <h2 className="mb-4">Manage Variants for
                    <Badge bg="info" className="ms-2">{product?.name}</Badge>
                </h2>
                <Row>
                    {/* Product Preview Side */}
                    <Col md={3}>
                        <Card className="sticky-top" style={{ top: '20px' }}>
                            <Card.Img variant="top" src={`http://localhost:8080/product-images/${product?.imageUrl}`} />
                            <Card.Body>
                                <h5>{product?.name}</h5>
                                <Badge bg="secondary">{product?.brand?.name}</Badge>
                                <p className="text-primary fw-bold">Base Price: ₹{product?.basePrice}</p>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={9}>
                        {/* SECTION 1: AVAILABLE VARIANTS */}
                        <div className="mb-5">
                            <h4 className="mb-3">Existing Variants</h4>
                            <Card className="shadow-sm border-0">
                                <AvailableVariantsTable productId={productId} availableVariants={availableVariants} setAvailableVariants={setAvailableVariants} />
                            </Card>
                        </div>

                        <hr />

                        {/* SECTION 2: MANAGE / ADD NEW VARIANTS */}
                        <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4>Add New Variants</h4>
                                <Button variant="primary" size="sm" onClick={addNewRow}>
                                    <i className="bi bi-plus-lg"></i> Add Row
                                </Button>
                            </div>

                            {newVariants.length > 0 ? (
                                <Card className="p-3 shadow-sm border-primary">
                                    <Table borderless size="sm">
                                        <thead>
                                            <tr className="text-muted small">
                                                <th>SIZE</th>
                                                <th>COLOR</th>
                                                <th>ADDITIONAL PRICE</th>
                                                <th>STOCK</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {newVariants.map((v, index) => (
                                                <tr key={index}>
                                                    <td><Form.Control placeholder="XL" onChange={e => handleNewVariantChange(index, 'size', e.target.value)} /></td>
                                                    <td><Form.Control placeholder="Red" onChange={e => handleNewVariantChange(index, 'color', e.target.value)} /></td>
                                                    <td><Form.Control type="number" placeholder="0" onChange={e => handleNewVariantChange(index, 'additionalPrice', e.target.value)} /></td>
                                                    <td><Form.Control type="number" placeholder="10" onChange={e => handleNewVariantChange(index, 'stockQuantity', e.target.value)} /></td>
                                                    <td>
                                                        <Button variant="link" className="text-danger" onClick={() => setNewVariants(newVariants.filter((_, i) => i !== index))}>
                                                            <i className="bi bi-x-circle"></i>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    <Button variant="success" className="mt-2" onClick={handleSaveNewVariants}>
                                        Save New Variants
                                    </Button>
                                </Card>
                            ) : (
                                <div className="text-center p-4 border rounded bg-light">
                                    <p className="mb-0 text-muted">Click "+ Add Row" to start adding variants.</p>
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