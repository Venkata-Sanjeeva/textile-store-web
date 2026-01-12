import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { BoxSeam, PersonCircle, BoxArrowRight } from 'react-bootstrap-icons';
import { useNavigate, Link } from 'react-router-dom';

const NavbarComponent = () => {
    const navigate = useNavigate();
    const tokenData = sessionStorage.getItem("token");
    const user = tokenData ? JSON.parse(tokenData) : null;

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <Navbar bg="white" expand="lg" className="border-bottom sticky-top shadow-sm">
            <Container fluid>
                {/* BRAND NAME */}
                <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-primary">
                    <BoxSeam className="me-2 mb-1" />
                    THE TEXTILE HUB
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto ms-3">
                        {user?.role === 'ADMIN' && (
                            <>
                                <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
                                <Nav.Link as={Link} to="/admin/inventory">Inventory</Nav.Link>
                                <Nav.Link as={Link} to="/admin/billing">Billing</Nav.Link>
                                <Nav.Link as={Link} to="/admin/print-labels">Print Labels</Nav.Link>
                                <Nav.Link as={Link} to="/admin/sales">Sales</Nav.Link>
                            </>
                        )}
                    </Nav>

                    <Nav className="align-items-center">
                        {user ? (
                            <NavDropdown 
                                title={<span><PersonCircle className="me-1" /> {user.username}</span>} 
                                id="admin-dropdown" 
                                align="end"
                            >
                                <NavDropdown.Item href="#profile">Profile Settings</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                                    <BoxArrowRight className="me-2" /> Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Button variant="primary" size="sm" onClick={() => navigate("/login")}>
                                Login
                            </Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;