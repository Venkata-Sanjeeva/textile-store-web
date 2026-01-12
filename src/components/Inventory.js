import { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavbarComponent from './NavbarComponent';

const Inventory = () => {
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form States
    const [categoryName, setCategoryName] = useState('');
    const [brandName, setBrandName] = useState('');
    const [product, setProduct] = useState({
        name: '', description: '', price: '', categoryId: '', brandId: ''
    });
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('token'));
        if (!user || user.role !== 'ADMIN') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            const [catRes, brandRes] = await Promise.all([
                axios.get('http://localhost:8080/api/categories'),
                axios.get('http://localhost:8080/api/brands')
            ]);
            setCategories(catRes.data);
            setBrands(brandRes.data);
        } catch (err) {
            console.error("Failed to fetch metadata", err);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/categories', { name: categoryName });
            setCategoryName('');
            fetchData();
            setMessage({ type: 'success', text: `Category "${categoryName}" Added!` });
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to Add Category!' });
        }
    };

    const handleAddBrand = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/brands', { name: brandName });
            setBrandName('');
            fetchData();
            setMessage({ type: 'success', text: `Brand "${brandName}" Added!` });
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to Add Brand!' });
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Generate the Business Key: PROD-XXXXXX
        const businessKey = `PROD-${uuidv4().substring(0, 8).toUpperCase()}`;
        
        const formData = new FormData();
        formData.append('uniqueId', businessKey);
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', parseFloat(product.price)); // Ensure double/float
        formData.append('categoryId', parseInt(product.categoryId)); // Ensure Long
        formData.append('brandId', parseInt(product.brandId)); // Ensure Long
        formData.append('image', image);

        try {
            await axios.post('http://localhost:8080/api/admin/products/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setMessage({ type: 'success', text: `Product ${product.name} uploaded with ID: ${businessKey}` });
            
            // Optional: Redirect to variant management for the new product immediately
            if(window.confirm("Product created! Do you want to add sizes/colors (variants) now?")) {
                navigate(`/admin/products/${businessKey}/variants`);
            } else {
                window.location.reload();
            }
        } catch (err) {
            setMessage({ type: 'danger', text: err.response?.data || 'Upload Failed!' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/login');
    };

    return (
        <>
            <NavbarComponent />
            <Container className="mt-5 pb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold text-dark">Inventory Dashboard</h2>
                </div>

                {message.text && (
                    <Alert variant={message.type} onClose={() => setMessage({type:'', text:''})} dismissible>
                        {message.text}
                    </Alert>
                )}

                <Tabs defaultActiveKey="product" className="mb-4 custom-tabs">
                    <Tab eventKey="product" title="Step 1: Create Product">
                        <Card className="shadow-sm border-0 p-4">
                            <Form onSubmit={handleAddProduct}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold text-uppercase">Product Name</Form.Label>
                                            <Form.Control 
                                                placeholder="e.g. Premium Cotton Tee" 
                                                onChange={(e) => setProduct({ ...product, name: e.target.value })} 
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold text-uppercase">Base Price (₹)</Form.Label>
                                            <Form.Control 
                                                type="number" 
                                                placeholder="999" 
                                                onChange={(e) => setProduct({ ...product, price: e.target.value })} 
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-uppercase">Description</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={3} 
                                        placeholder="Enter product details..."
                                        onChange={(e) => setProduct({ ...product, description: e.target.value })} 
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold text-uppercase">Category</Form.Label>
                                            <Form.Select 
                                                value={product.categoryId}
                                                onChange={(e) => setProduct({ ...product, categoryId: e.target.value })} 
                                                required
                                            >
                                                <option value="">Choose...</option>
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold text-uppercase">Brand</Form.Label>
                                            <Form.Select 
                                                value={product.brandId}
                                                onChange={(e) => setProduct({ ...product, brandId: e.target.value })} 
                                                required
                                            >
                                                <option value="">Choose...</option>
                                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-uppercase">Display Image</Form.Label>
                                    <Form.Control type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100 py-2" disabled={loading}>
                                    {loading ? <Spinner size="sm" /> : "Register Product & Proceed"}
                                </Button>
                            </Form>
                        </Card>
                    </Tab>

                    <Tab eventKey="config" title="Step 0: Setup Metadata">
                        <Row className="g-4">
                            <Col md={6}>
                                <Card className="h-100 shadow-sm border-0 p-3">
                                    <h5 className="border-bottom pb-2">Categories</h5>
                                    <Form onSubmit={handleAddCategory} className="mt-2">
                                        <Form.Control 
                                            className="mb-2" 
                                            value={categoryName} 
                                            onChange={(e) => setCategoryName(e.target.value)} 
                                            placeholder="e.g. Shirts" 
                                        />
                                        <Button variant="dark" type="submit" size="sm">Add Category</Button>
                                    </Form>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="h-100 shadow-sm border-0 p-3">
                                    <h5 className="border-bottom pb-2">Brands</h5>
                                    <Form onSubmit={handleAddBrand} className="mt-2">
                                        <Form.Control 
                                            className="mb-2" 
                                            value={brandName} 
                                            onChange={(e) => setBrandName(e.target.value)} 
                                            placeholder="e.g. Adidas" 
                                        />
                                        <Button variant="dark" type="submit" size="sm">Add Brand</Button>
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