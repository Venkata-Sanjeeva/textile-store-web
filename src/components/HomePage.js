import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import axios from 'axios';
import FilterSidebar from './FilterSidebar';
import Product from './Product';
import NavbarComponent from './NavbarComponent';

const HomePage = () => {
    const [filteredProducts, setFilteredProducts] = useState([]);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(true);

    // Inside your HomePage component, add these states and functions:
    const [brands, setBrands] = useState([]); // To store brands for the filter dropdown

    const [prodVariants, setProdVariants] = useState({}); // To store variants of a product if needed
    const [catProducts, setCatProducts] = useState({}); // To store products if needed

    const [prodQuantity, setProdQuantity] = useState({}); // To store total stock quantity per product

    const fetchInitialProducts = () => {
        setLoading(true);
        // Fetch all products initially (or just use your category-based fetch)
        axios.get('http://localhost:8080/api/admin/products')
            .then(res => {
                setFilteredProducts(res.data);
                setIsFiltering(false);
                setLoading(false);
            });
    };

    // Add this function to handle the filter logic
    const handleFilterUpdate = (filters) => {
        setIsFiltering(true);
        const { categoryId, brandId, size, searchTerm } = filters;

        const ENDPOINT = "http://localhost:8080/api/admin/products/filter";
        axios.get(ENDPOINT, { params: { categoryId, brandId, size, search: searchTerm } })
            .then(res => {
                setFilteredProducts(res.data);
            })
            .catch(err => console.error(err));
    };

    const groupedProducts = filteredProducts.reduce((groups, product) => {
        const categoryName = product.category.name;
        if (!groups[categoryName]) {
            groups[categoryName] = [];
        }
        groups[categoryName].push(product);
        return groups;
    }, {});

    // Fetch categories and brands
    useEffect(() => {
        fetchInitialProducts();

        axios.get('http://localhost:8080/api/categories')
            .then(res => {
                const data = res.data;
                setCategories(data);

                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching data", err);
                setLoading(false);
            });
        axios.get('http://localhost:8080/api/brands')
            .then(res => setBrands(res.data))
            .catch(err => {
                console.error("Error fetching brands", err);
            });
    }, []);

    // Fetch products for each category
    useEffect(() => {
        for (let category of categories) {
            const catId = category.id;

            axios.get(`http://localhost:8080/api/admin/products/category/${catId}`)
                .then(res => {
                    const products = res.data;
                    setCatProducts(prevState => ({ ...prevState, [catId]: products }));
                })
                .catch(err => {
                    console.error(`Error fetching products for category ${catId}`, err);
                });
        }
    }, [categories]);

    // Fetch variants for each product
    useEffect(() => {
        for (let category of categories) {
            const catId = category.id;
            for (let product of catProducts[catId] || []) {
                axios.get(`http://localhost:8080/api/admin/variants/${product.id}`)
                    .then(res => {
                        const variants = res.data;
                        setProdVariants(prevState => ({ ...prevState, [product.id]: variants }));
                    })
                    .catch(err => {
                        console.error(`Error fetching variants for product ${product.id}`, err);
                    });
            }
        }
    }, [catProducts]);

    // Calculate total stock quantity for each product
    useEffect(() => {
        const quantities = {};
        for (let productId in prodVariants) {
            const variants = prodVariants[productId];
            const totalQuantity = variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
            quantities[productId] = totalQuantity;
        }
        setProdQuantity(quantities);
    }, [prodVariants]);

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
                            <Button variant="link" onClick={() => {window.location.reload()}}>Clear all filters</Button>
                        </div>
                    ) : (
                        Object.keys(groupedProducts).map((categoryName) => (
                            <div key={categoryName} className="mb-5">
                                <h3 className="border-bottom pb-2 mb-4">
                                    {categoryName}
                                    {isFiltering && <small className="text-muted ms-2">({groupedProducts[categoryName].length} items found)</small>}
                                </h3>
                                <Row xs={1} md={2} lg={4} className="g-4">
                                    {groupedProducts[categoryName].map(product => (
                                        <Col key={product.id}>
                                            <Product product={product} productQuantity={prodQuantity} />
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