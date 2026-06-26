import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../services/auth";
import { useToast } from "../context/ToastContext";

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Cart() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);

  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  });

  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);

    const handleCartUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCart(updatedCart);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  useEffect(() => {
    const totalPrice = cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
    setTotal(totalPrice);
  }, [cart]);

  const removeItem = (index) => {
    setCart((prevCart) => {
      const updated = prevCart.filter((_, i) => i !== index);
      localStorage.setItem("cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("cartUpdated"));
      return updated;
    });
    addToast("Item removed from cart", "info");
  };

  const updateQuantity = (index, newQty) => {
    if (newQty < 1) return;
    setCart((prevCart) => {
      const updated = prevCart.map((item, i) =>
        i === index ? { ...item, quantity: newQty } : item
      );
      localStorage.setItem("cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("cartUpdated"));
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
    setStatus("Your cart has been cleared.");
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardDetails({ ...cardDetails, cardNumber: formatted });
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    setCardDetails({ ...cardDetails, expiry: formatted });
  };

  const validateForm = () => {
    if (!shippingAddress.name || !shippingAddress.email || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      setStatus("Please fill in all shipping details.");
      return false;
    }
    if (paymentMethod === "card") {
      const cardNum = cardDetails.cardNumber.replace(/\s/g, "");
      if (cardNum.length < 16 || !cardDetails.cardHolder || cardDetails.expiry.length < 5 || cardDetails.cvv.length < 3) {
        setStatus("Please enter valid card details.");
        return false;
      }
    }
    return true;
  };

  const processPayment = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);
    setStatus("");

    const token = getToken();
    if (!token) {
      setStatus("Please login to complete checkout.");
      setIsProcessing(false);
      navigate("/login");
      return;
    }

    try {
      // Calculate total fresh right before sending
      const currentTotal = cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
      console.log("Checkout payload:", {
        itemsCount: cart.length,
        total: currentTotal,
        paymentMethod,
        firstItem: cart[0]?.name,
        firstItemPrice: cart[0]?.price
      });

      const orderData = {
        items: cart.map((item) => ({
          productId: item.id || item._id || String(item.name),
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          image: item.image,
        })),
        totalAmount: currentTotal,
        shippingAddress,
        paymentMethod,
      };

      // COD - direct order creation
      if (paymentMethod === "cod") {
        const baseUrl = import.meta.env.VITE_API_URL || "https://rajstore.onrender.com/api";
        const res = await axios.post(
          `${baseUrl}/orders/checkout`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.order?._id) {
          setOrderId(res.data.order._id);
          setOrderTotal(res.data.order.totalAmount);
          setOrderComplete(true);
          setCart([]);
          localStorage.removeItem("cart");
          setStatus("");
        }
        return;
      }

      // Card/UPI - Use Razorpay
      const baseUrl = import.meta.env.VITE_API_URL || "https://rajstore.onrender.com/api";
      const res = await axios.post(
        `${baseUrl}/orders/checkout`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.razorpayOrder) {
        const razorpayLoaded = await loadRazorpay();
        if (!razorpayLoaded) {
          setStatus("Failed to load payment gateway. Please try again.");
          setIsProcessing(false);
          return;
        }

        const options = {
          key: "rzp_test_SvzKcZX5yoa4fI", // Replace with your Razorpay Key ID
          amount: res.data.razorpayOrder.amount,
          currency: "INR",
          name: "RajStore",
          description: "Order Payment",
          order_id: res.data.razorpayOrder.id,
          handler: async (response) => {
            // Verify payment on backend
            try {
              const baseUrl = import.meta.env.VITE_API_URL || "https://rajstore.onrender.com/api";
              const verifyRes = await axios.post(
                `${baseUrl}/orders/verify-payment`,
                {
                  orderId: res.data.order._id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (verifyRes.data.order) {
                setOrderId(res.data.order._id);
                setOrderTotal(res.data.order.totalAmount);
                setOrderComplete(true);
                setCart([]);
                localStorage.removeItem("cart");
                addToast("Payment successful!", "success");
              }
            } catch (err) {
              setStatus("Payment verification failed. Please contact support.");
              addToast("Payment verification failed", "error");
            }
          },
          prefill: {
            name: shippingAddress.name,
            email: shippingAddress.email,
          },
          theme: {
            color: "#4d6fff",
          },
        };

        const paymentWindow = new window.Razorpay(options);
        paymentWindow.on("payment.failed", (response) => {
          setStatus(`Payment failed: ${response.error.description}`);
          addToast("Payment failed", "error");
        });
        paymentWindow.open();
      }
    } catch (err) {
      setStatus(err?.response?.data?.message || "Payment failed. Please try again.");
      addToast("Payment failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const startCheckout = () => {
    const token = getToken();
    if (!token) {
      setStatus("Please login to checkout.");
      navigate("/login");
      return;
    }
    setShowCheckout(true);
  };

  if (orderComplete) {
    return (
      <main className="cart-page container py-5">
        <div className="order-success-card rounded-4 shadow-sm p-5 text-center">
          <div className="success-icon mb-4">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>Order Placed Successfully!</h2>
          <p className="text-muted mb-4">Thank you for your purchase. Your order has been confirmed.</p>
          <div className="order-details mb-4">
            <p><strong>Order ID:</strong> {orderId}</p>
            <p><strong>Total Amount:</strong> ₹{orderTotal.toFixed(2)}</p>
          </div>
          <Link to="/products" className="btn btn-outline-secondary mt-3 me-2">Continue Shopping</Link>
          <Link to="/orders" className="btn btn-primary mt-3">View Orders</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page container py-5">
      <div className="page-header mb-4">
        <div>
          <p className="eyebrow">Your basket</p>
          <h1>Shopping cart</h1>
          <p className="text-muted">Review your selected items before checkout.</p>
        </div>
        <div className="cart-meta">
          <span>{cart.length} item{cart.length === 1 ? "" : "s"}</span>
          <span>Total value</span>
          <strong>₹{total.toFixed(2)}</strong>
        </div>
      </div>

      {status && (
        <div className={`alert ${status.includes("success") ? "alert-success" : "alert-danger"}`}>
          {status}
        </div>
      )}

      {cart.length === 0 && !showCheckout ? (
        <div className="empty-cart-card rounded-4 shadow-sm p-5 text-center">
          <h2>Your cart is empty</h2>
          <p className="text-muted">Keep browsing and add items you love.</p>
          <Link to="/products" className="btn btn-primary mt-3">Continue shopping</Link>
        </div>
      ) : showCheckout ? (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="checkout-form rounded-4 shadow-sm p-4">
              <h3 className="mb-4">Shipping Information</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    placeholder="Street address"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    placeholder="Postal code"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    placeholder="Country"
                  />
                </div>
              </div>

              <h3 className="mt-5 mb-4">Payment Method</h3>
              <div className="payment-methods mb-4">
                <div className="form-check me-4">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="card"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="card">Credit/Debit Card</label>
                </div>
                <div className="form-check me-4">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="upi"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="upi">UPI</label>
                </div>
                <div className="form-check me-4">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="netbanking"
                    name="paymentMethod"
                    value="netbanking"
                    checked={paymentMethod === "netbanking"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="netbanking">Net Banking</label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="cod">Cash on Delivery</label>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="card-payment-form">
                  <h4 className="mb-3">Card Details</h4>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={cardDetails.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Card Holder Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={cardDetails.cardHolder}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardHolder: e.target.value })}
                        placeholder="Name on card"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="text"
                        className="form-control"
                        value={cardDetails.expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">CVV</label>
                      <input
                        type="password"
                        className="form-control"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "cod" && (
                <div className="cod-info alert alert-info mt-3">
                  <p className="mb-0">You will pay ₹{total.toFixed(2)} upon delivery.</p>
                </div>
              )}

              <div className="d-flex gap-3 mt-4">
                <button className="btn btn-outline-secondary" onClick={() => setShowCheckout(false)}>
                  Back to Cart
                </button>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={processPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>

          <aside className="col-lg-4">
            <div className="checkout-summary rounded-4 shadow-sm p-4">
              <h3>Order Summary</h3>
              <div className="summary-items my-3">
                {cart.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between mb-2">
                    <span>{item.name}</span>
                    <strong>₹{item.price.toFixed(2)}</strong>
                  </div>
                ))}
              </div>
              <div className="summary-line">
                <span>Subtotal</span>
                <strong>₹{total.toFixed(2)}</strong>
              </div>
              <div className="summary-line">
                <span>Shipping</span>
                <strong>Free</strong>
              </div>
              <div className="summary-line total-line">
                <span>Total</span>
                <strong>₹{total.toFixed(2)}</strong>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="cart-items">
              {cart.map((item, index) => (
                <article className="cart-item-card rounded-4 shadow-sm p-4 mb-4" key={index}>
                  <div className="item-grid">
                    <div className="item-media">
                      <img
                        src={item.image || "https://via.placeholder.com/120?text=No+Image"}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://via.placeholder.com/120?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <div>
                        <h3>{item.name}</h3>
                        <p>{item.description || "High quality product."}</p>
                      </div>
                      <div className="item-actions">
                        <span className="item-price">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                        <div className="quantity-controls">
                          <button className="btn btn-outline-secondary btn-sm" onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}>-</button>
                          <span className="qty-value">{item.quantity || 1}</span>
                          <button className="btn btn-outline-secondary btn-sm" onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}>+</button>
                        </div>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => removeItem(index)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="col-lg-4">
            <div className="checkout-summary rounded-4 shadow-sm p-4">
              <h2>Order summary</h2>
              <p className="text-muted mb-4">Secure payment and delivery details at checkout.</p>
              <div className="summary-line">
                <span>Subtotal</span>
                <strong>₹{total.toFixed(2)}</strong>
              </div>
              <div className="summary-line">
                <span>Estimated shipping</span>
                <strong>Free</strong>
              </div>
              <div className="summary-line total-line">
                <span>Total</span>
                <strong>₹{total.toFixed(2)}</strong>
              </div>
              <button className="btn btn-primary btn-lg w-100 mt-4" onClick={startCheckout}>
                Checkout securely
              </button>
              <button className="btn btn-outline-secondary w-100 mt-3" onClick={clearCart}>
                Clear cart
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;