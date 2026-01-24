import { useState } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
// import 'bootstrap-icons/font/bootstrap-icons.css';

const CustomerModal = ({ showCustomerModal, setShowCustomerModal, handleCompleteOrder }) => {
    // Add state to hold the info from the modal
    const [customerInfo, setCustomerInfo] = useState({ name: 'Guest', phone: '' });

    return (
        <Modal
            show={showCustomerModal}
            onHide={() => setShowCustomerModal(false)}
            centered
            backdrop="static"
        >
            {/* Header */}
            <Modal.Header closeButton style={{ borderBottom: '1px solid #eee' }}>
                <Modal.Title>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '700' }}>Customer Details</h2>
                </Modal.Title>
            </Modal.Header>

            {/* Body */}
            <Modal.Body style={{ padding: '24px' }}>
                <Form>
                    {/* Name Input */}
                    <Form.Group className="mb-4">
                        <Form.Label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}>
                            Full Name
                        </Form.Label>
                        <InputGroup>
                            <InputGroup.Text style={{ background: '#f8f9fa' }}>
                                <i className="bi bi-person text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                value={customerInfo.name}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                placeholder="Enter customer name"
                                style={{ fontSize: '0.9rem', padding: '10px' }}
                            />
                        </InputGroup>
                    </Form.Group>

                    {/* Phone Input */}
                    <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}>
                            Phone Number
                        </Form.Label>
                        <InputGroup>
                            <InputGroup.Text style={{ background: '#f8f9fa' }}>
                                <i className="bi bi-telephone text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control
                                type="tel"
                                value={customerInfo.phone}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                placeholder="Enter mobile number"
                                style={{ fontSize: '0.9rem', padding: '10px' }}
                            />
                        </InputGroup>
                    </Form.Group>
                </Form>
            </Modal.Body>

            {/* Footer */}
            <Modal.Footer style={{ borderTop: 'none', padding: '15px 24px 24px' }}>
                <Button
                    variant="link"
                    className="text-decoration-none text-muted"
                    onClick={() => setShowCustomerModal(false)}
                    style={{ fontSize: '0.9rem' }}
                >
                    Skip
                </Button>
                <Button
                    onClick={() => handleCompleteOrder(customerInfo)}
                    style={{
                        background: 'var(--primary)',
                        border: 'none',
                        padding: '10px 25px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        borderRadius: '6px'
                    }}
                >
                    Generate Receipt <i className="bi bi-printer ms-2"></i>
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CustomerModal;