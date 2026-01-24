import { use, useEffect, useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { BoxSeam, PersonCircle, BoxArrowRight } from 'react-bootstrap-icons';
import { useNavigate, Link } from 'react-router-dom';

const NavbarComponent = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const checkUser = () => {
        const tokenData = sessionStorage.getItem("token");
        if (tokenData) {
            setUser(JSON.parse(tokenData));
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        // Initial check
        checkUser();

        // Listen for changes in other parts of the app (like VariantManager)
        window.addEventListener('storage', checkUser);

        // Custom interval check (Optional but safer for single-page redirects)
        const interval = setInterval(checkUser, 1000);

        return () => {
            window.removeEventListener('storage', checkUser);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        setUser(null); // Clear local state immediately
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
                                <Nav.Link as={Link} to="/admin/purchase-history">Purchase History</Nav.Link>
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
                            <div>
                                <Button variant="primary" size="sm" onClick={() => navigate("/register")} className="me-2">
                                    Register
                                </Button>
                                <Button variant="primary" size="sm" onClick={() => navigate("/login")}>
                                    Login
                                </Button>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;