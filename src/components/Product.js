import { Card, Badge } from 'react-bootstrap';

const BACKEND_API_URL = process.env.REACT_APP_API_URL;

function Product({ product, totalStock }) {

    const isOutOfStock = totalStock <= 0;

    return (
        <Card className="h-100 shadow-sm border-0 product-card overflow-hidden" style={{ borderRadius: '12px' }}>
            {/* Image Container with Fixed Aspect Ratio */}
            <div style={{ height: '220px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                <Card.Img
                    variant="top"
                    src={`${BACKEND_API_URL}/product-images/${product.imageUrl}`}
                    style={{ 
                        height: '100%', 
                        width: '100%', 
                        objectFit: 'contain', 
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease'
                    }}
                    className="product-img-hover"
                    alt={product.name}
                    onClick={() => window.location.href = `/admin/products/${product.uniqueId}/variants`}
                />
            </div>

            <Card.Body className="d-flex flex-column p-3">
                {/* Brand & Name */}
                <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                         <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                            {product.brand?.name || "Generic"}
                        </span>
                        <small className="text-muted" style={{ fontSize: '10px' }}>ID: {product.uniqueId}</small>
                    </div>
                    <Card.Title className="h6 mb-0 text-dark fw-bold" style={{ minHeight: '2.4em', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.name}
                    </Card.Title>
                </div>

                {/* Stock Badge */}
                <div className="mb-3">
                    <Badge bg={isOutOfStock ? "danger" : "success"} className="rounded-pill px-3 py-2" style={{ fontSize: '11px', fontWeight: '500' }}>
                        {isOutOfStock ? "Out of Stock" : `In Stock: ${totalStock}`}
                    </Badge>
                </div>

                {/* Description - Clamped to 2 lines */}
                <Card.Text className="text-muted mb-3" style={{ fontSize: '13px', minHeight: '3em' }}>
                    {product.description?.length > 70 
                        ? `${product.description.substring(0, 70)}...` 
                        : product.description}
                </Card.Text>

                {/* Price - Pushed to the bottom */}
                <div className="mt-auto pt-2 border-top">
                    <h5 className="text-primary mb-0 fw-bold">
                        ₹{product?.price || product?.basePrice}/-
                    </h5>
                </div>
            </Card.Body>
        </Card>
    );
}

export default Product;