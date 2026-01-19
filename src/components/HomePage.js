import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import axios from 'axios';
import FilterSidebar from './FilterSidebar';
import Product from './Product';
import NavbarComponent from './NavbarComponent';

const BACKEND_API_URL = process.env.REACT_APP_API_URL;

const HomePage = () => {
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);

    // Stores stock quantity indexed by uniqueId
    const [prodQuantity, setProdQuantity] = useState({});

    // 1. Fetch initial products and metadata
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes, brandRes] = await Promise.all([
                axios.get(`${BACKEND_API_URL}/admin/products`),
                axios.get(`${BACKEND_API_URL}/categories`),
                axios.get(`${BACKEND_API_URL}/brands`)
            ]);

            const products = prodRes.data;
            // Pre-fetch stock quantities for all products
            const variants = products.flatMap(product =>
                axios.get(`${BACKEND_API_URL}/admin/variants/product/${product.uniqueId}`)
                    .then(res => {
                        const variants = res.data;
                        const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);
                        return { uniqueId: product.uniqueId, totalStock };
                    })
            );

            // Wait for all stock quantities to be fetched
            const stockData = await Promise.all(variants);
            setProdQuantity(prev => {
                const newStock = {};
                stockData.forEach(item => {
                    newStock[item.uniqueId] = item.totalStock;
                });
                return { ...prev, ...newStock };
            });

            setFilteredProducts([...products]);
            setCategories(catRes.data);
            setBrands(brandRes.data);
        } catch (err) {
            console.error("Error loading initial data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // 2. Optimized Filter Handler
    const handleFilterUpdate = (filters) => {
        setIsFiltering(true);
        const { categoryId, brandId, size, searchTerm } = filters;

        const params = {
            categoryId: categoryId || undefined,
            brandId: brandId || undefined,
            size: size || undefined,
            search: searchTerm || undefined
        }

        axios.get(`${BACKEND_API_URL}/admin/products/filter`, {params})
            .then(res => {
                setFilteredProducts(res.data);
                setIsFiltering(false);
            })
            .catch(err => console.error(err));
    };

    // 3. Fetch Stock/Variants for visible products only
    // This uses the new uniqueId endpoint
    useEffect(() => {
        if (filteredProducts.length === 0) return;

        filteredProducts.forEach(product => {
            // Use the new mapping: /api/admin/variants/product/{uniqueId}
            axios.get(`${BACKEND_API_URL}/admin/variants/product/${product.uniqueId}`)
                .then(res => {
                    const variants = res.data;
                    const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);

                    setProdQuantity(prev => ({
                        ...prev,
                        [product.uniqueId]: totalStock
                    }));
                })
                .catch(err => console.error("Error fetching variants", err));
        });
    }, [filteredProducts]);

    // 4. Dynamic Grouping by Category Name
    const groupedProducts = filteredProducts.reduce((groups, product) => {
        const categoryName = product.category?.name || "Uncategorized";
        if (!groups[categoryName]) groups[categoryName] = [];
        groups[categoryName].push(product);
        return groups;
    }, {});

    return (
        <>
            <NavbarComponent />
            <Container className="mt-4">
                <div>
                    <h1 className="text-center mb-5">Our Collection</h1>
                </div>
                <Row>
                    <Col>
                        <FilterSidebar brands={brands} categories={categories} onFilterChange={handleFilterUpdate} />
                    </Col>

                    {loading ? (
                        <div className="text-center mt-5"><Spinner animation="border" /></div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center mt-5">
                            <h4>No products matches your criteria.</h4>
                            <Button variant="link" onClick={() => { window.location.reload() }}>Clear all filters</Button>
                        </div>
                    ) : (
                        Object.keys(groupedProducts).map((categoryName) => (
                            <div key={categoryName} className="mb-5">
                                <h3 className="border-bottom pb-2 mb-4">
                                    {categoryName}
                                </h3>
                                <Row xs={1} md={2} lg={4} className="g-4">
                                    {groupedProducts[categoryName].map(product => (
                                        <Col key={product.id}>
                                            <Product product={product} totalStock={prodQuantity[product.uniqueId]} />
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        ))
                    )}
                </Row>
            </Container>
        </>
    );
};

export default HomePage;