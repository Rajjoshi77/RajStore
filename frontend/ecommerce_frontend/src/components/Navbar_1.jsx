import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../component_css/Navbar_css.css';
import { useAuth } from '../context/AuthContext';

function Navbar_1() {
  const { authed, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const onLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/products');
    }
    setSearchQuery('');
  };

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(storedCart.length);

    const handleCartUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(updatedCart.length);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  return (
    <>
      <Navbar expand="lg" className="bg-lightblue navbar-custom">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="navbar-brand-custom">RajStore</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: '100px' }}
              navbarScroll
            >
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/products">Products</Nav.Link>
              <NavDropdown title="More" id="navbarScrollingDropdown">
                <NavDropdown.Item as={Link} to="/products">Categories</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/contact">Contact Us</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link as={Link} to="/about">About Us</Nav.Link>
              {user?.role === "admin" && (
                <Nav.Link as={Link} to="/admin" className="text-danger fw-bold">Admin Panel</Nav.Link>
              )}
            </Nav>

            <Form className="d-flex" onSubmit={handleSearchSubmit}>
              <Form.Control
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="outline-success">Search</Button>
            </Form>

            <div className="navbar-right">
              {authed && (
                <Nav.Link as={Link} to="/orders" className="orders-link me-3" aria-label="Orders">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                    <rect x="9" y="3" width="6" height="4" rx="1"></rect>
                    <path d="M9 14l2 2 4-4"></path>
                  </svg>
                  <span className="ms-1">Orders</span>
                </Nav.Link>
              )}
              <Nav.Link as={Link} to="/cart" aria-label="Cart" className="cart-link">
                <span className="cart-icon" aria-hidden="true">🛒</span>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </Nav.Link>

              <div className="profile-section">
                {authed ? (
                  <>
                    <span className="profile-welcome">Hi, {user?.name || 'User'}</span>
                    <button className="profile-btn" onClick={onLogout} title="Logout">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login" className="ms-2 auth-link">Login</Nav.Link>
                    <Nav.Link as={Link} to="/register" className="ms-2 auth-link">Register</Nav.Link>
                  </>
                )}
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Navbar_1;
