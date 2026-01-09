import { Col, Card, Badge } from 'react-bootstrap';

export default function Product({product, productQuantity}) {
    return (
        <Col>
            <Card className="h-100 shadow-sm border-0 product-card">
                <Card.Img
                    variant="top"
                    src={`http://localhost:8080/product-images/${product.imageUrl}`}
                    style={{ height: '250px', objectFit: 'cover' }}
                    alt={"Product Image"}
                    onClick={() => window.location.href = `/admin/products/${product.id}/variants`}
                />
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                        <Card.Title className="mb-0">{product.name}</Card.Title>
                        <Badge bg="secondary">{product.brand?.name}</Badge> &nbsp;
                        <Badge bg={`${productQuantity[product.id] > 0 ? "success" : "danger"}`}>{productQuantity[product.id] || 0}</Badge>
                    </div>
                    <Card.Text className="text-muted small mt-2">
                        {product.description?.substring(0, 60)}...
                    </Card.Text>
                    <h5 className="text-primary mt-auto">
                        <span className="rupee-logo">₹</span> {product?.basePrice}/-
                    </h5>
                </Card.Body>
            </Card>
        </Col>
    );
}
