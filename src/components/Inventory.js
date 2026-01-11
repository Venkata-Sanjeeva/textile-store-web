import { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Tabs, Tab, Alert, Nav } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavbarComponent from './NavbarComponent';

const Inventory = () => {
    // States for data
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // States for Form Inputs
    const [categoryName, setCategoryName] = useState('');
    const [brandName, setBrandName] = useState('');
    const [product, setProduct] = useState({
        name: '', description: '', price: '', categoryId: '', brandId: ''
    });
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    // Fetch Categories and Brands for the Dropdowns
    useEffect(() => {
        const token = JSON.parse(sessionStorage.getItem('token'));

        if (token === undefined || token === null || token.role !== 'ADMIN') {
            navigate('/login'); // Redirect to login if not authenticated
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const catRes = await axios.get('http://localhost:8080/api/categories');
            const brandRes = await axios.get('http://localhost:8080/api/brands');
            setCategories(catRes.data);
            setBrands(brandRes.data);
        } catch (err) {
            console.error("Authorization failed or server down", err);
        }
    };

    // 1. Add Category Logic
    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/categories', { name: categoryName });
            setCategoryName('');
            fetchData();
            setMessage({ type: 'success', text: 'Category Added!' });
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to Add Category!' });
        }
    };

    // 2. Add Brand Logic
    const handleAddBrand = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/brands', { name: brandName });
            setBrandName('');
            fetchData();
            setMessage({ type: 'success', text: 'Brand Added!' });
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to Add Brand!' });
        }
    };

    // 3. Add Product Logic (Using FormData for Image)
    const handleAddProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', product.price);
        formData.append('categoryId', Number(product.categoryId));
        formData.append('brandId', Number(product.brandId));
        formData.append('image', image);

        console.log("Form Data Submitted:", product, image);

        try {
            await axios.post('http://localhost:8080/api/admin/products/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage({ type: 'success', text: 'Product Uploaded Successfully!' });
            
            alert('Product Uploaded Successfully!');
            window.location.reload();

        } catch (err) {
            setMessage({ type: 'danger', text: 'Upload Failed! Are you logged in?' });
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('userRole');
        window.location.href = '/login';
    };

    return (
        <>
            <NavbarComponent />
            <Container className="mt-5">
            <h2 className="mb-4">
                Inventory Management
                <Button variant="outline-danger" className="float-end" onClick={handleLogout}>
                    Logout
                </Button>
            </h2>

            {message.text && <Alert variant={message.type}>{message.text}</Alert>}

            <Tabs defaultActiveKey="product" className="mb-3">
                {/* PRODUCT TAB */}
                <Tab eventKey="product" title="Add Product">
                    <Card className="p-4">
                        <Form onSubmit={handleAddProduct}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Product Name</Form.Label>
                                        <Form.Control type="text" onChange={(e) => setProduct({ ...product, name: e.target.value })} required />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Price</Form.Label>
                                        <Form.Control type="number" onChange={(e) => setProduct({ ...product, price: e.target.value })} required />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" rows={2} onChange={(e) => setProduct({ ...product, description: e.target.value })} />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Category</Form.Label>
                                        <Form.Select onChange={(e) => setProduct({ ...product, categoryId: e.target.value })} required>
                                            <option value="">Select Category</option>
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Brand</Form.Label>
                                        <Form.Select onChange={(e) => setProduct({ ...product, brandId: e.target.value })} required>
                                            <option value="">Select Brand</option>
                                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Product Image</Form.Label>
                                <Form.Control type="file" onChange={(e) => setImage(e.target.files[0])} required />
                            </Form.Group>

                            <Button variant="primary" type="submit">Upload Product</Button>
                        </Form>
                    </Card>
                </Tab>

                {/* CATEGORY & BRAND TAB */}
                <Tab eventKey="config" title="Categories & Brands">
                    <Row>
                        <Col md={6}>
                            <Card className="p-3">
                                <h5>Add Category</h5>
                                <Form onSubmit={handleAddCategory}>
                                    <Form.Control className="mb-2" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g. Shirts" />
                                    <Button variant="dark" type="submit">Save Category</Button>
                                </Form>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="p-3">
                                <h5>Add Brand</h5>
                                <Form onSubmit={handleAddBrand}>
                                    <Form.Control className="mb-2" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Nike" />
                                    <Button variant="dark" type="submit">Save Brand</Button>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </Tab>
            </Tabs>
        </Container>
        </>
    );
};

export default Inventory;