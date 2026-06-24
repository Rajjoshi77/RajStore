import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../services/auth";
import { useToast } from "../context/ToastContext";

const API_URL = "http://localhost:5000/api/orders";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await axios.get(`${API_URL}/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      addToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-warning text-dark",
      confirmed: "bg-info",
      shipped: "bg-primary",
      delivered: "bg-success",
      cancelled: "bg-danger",
      paid: "bg-success",
      failed: "bg-danger",
    };
    return colors[status] || "bg-secondary";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="orders-page container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page container py-5">
      <div className="page-header mb-4">
        <div>
          <p className="eyebrow">Your purchases</p>
          <h1>Order History</h1>
          <p className="text-muted">View and track all your orders</p>
        </div>
        <div className="cart-meta">
          <span>{orders.length} order{orders.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders-card rounded-4 shadow-sm p-5 text-center">
          <div className="empty-icon mb-4">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
              <rect x="9" y="3" width="6" height="4" rx="1"></rect>
              <path d="M9 14l2 2 4-4"></path>
            </svg>
          </div>
          <h2>No orders yet</h2>
          <p className="text-muted">Start shopping to see your orders here.</p>
          <a href="/products" className="btn btn-primary mt-3">Browse Products</a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card rounded-4 shadow-sm mb-4 overflow-hidden">
              <div
                className="order-header p-4 d-flex justify-content-between align-items-center"
                onClick={() => toggleOrder(order._id)}
                style={{ cursor: "pointer", background: "#f8f9fa" }}
              >
                <div className="d-flex gap-4 align-items-center">
                  <div className="order-id">
                    <span className="text-muted small">Order ID</span>
                    <p className="mb-0 fw-bold">{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="order-date">
                    <span className="text-muted small">Date</span>
                    <p className="mb-0">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="order-total">
                    <span className="text-muted small">Total</span>
                    <p className="mb-0 fw-bold">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="order-status">
                    <span className={`badge ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                  </div>
                  <div className="order-payment">
                    <span className={`badge ${order.paymentStatus === "paid" ? "bg-success" : "bg-warning text-dark"}`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="expand-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ transform: expandedOrder === order._id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              {expandedOrder === order._id && (
                <div className="order-details border-top p-4">
                  <div className="row g-4">
                    <div className="col-lg-6">
                      <h6 className="text-muted mb-3">Items</h6>
                      <div className="items-list">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                            <div className="d-flex align-items-center gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "https://via.placeholder.com/50?text=No+Img";
                                  }}
                                />
                              )}
                              <div>
                                <p className="mb-0 fw-medium">{item.name}</p>
                                <small className="text-muted">Qty: {item.quantity} × ₹{item.price}</small>
                              </div>
                            </div>
                            <span className="fw-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-summary mt-3 pt-3 border-top">
                        <div className="d-flex justify-content-between mb-2">
                          <span>Subtotal</span>
                          <span>₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Shipping</span>
                          <span className="text-success">Free</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold pt-2 border-top">
                          <span>Total</span>
                          <span>₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <h6 className="text-muted mb-3">Shipping Address</h6>
                      <div className="shipping-address">
                        <p className="mb-1 fw-medium">{order.shippingAddress.name}</p>
                        <p className="mb-1">{order.shippingAddress.address}</p>
                        <p className="mb-1">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                        <p className="mb-1">{order.shippingAddress.country}</p>
                        <p className="mb-0 text-muted">{order.shippingAddress.email}</p>
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <h6 className="text-muted mb-3">Payment Details</h6>
                      <div className="payment-details">
                        <p className="mb-2">
                          <span className="text-muted">Method:</span>{" "}
                          <span className="text-capitalize">{order.paymentMethod}</span>
                        </p>
                        <p className="mb-2">
                          <span className="text-muted">Status:</span>{" "}
                          <span className={`badge ${getStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </p>
                        {order.razorpayPaymentId && (
                          <p className="mb-0">
                            <span className="text-muted">Transaction:</span>{" "}
                            <small>{order.razorpayPaymentId.slice(-10)}</small>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Orders;