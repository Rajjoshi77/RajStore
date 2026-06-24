import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../services/auth";
import { useToast } from "../context/ToastContext";

const API_BASE = "http://localhost:5000/api";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const { addToast } = useToast();

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
    productID: "",
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    } else {
      fetchOrders();
    }
  }, [activeTab]);

  // Fetch all products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await axios.get(`${API_BASE}/products`);
      setProducts(res.data);
    } catch (err) {
      addToast("Failed to load products", "error");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    const token = getToken();
    try {
      const res = await axios.get(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      addToast("Failed to load orders", "error");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Product form change handler
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit product (Create or Update)
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    
    // Validations
    if (!productForm.name || !productForm.price || !productForm.stock || !productForm.productID) {
      addToast("Please fill all required fields", "warning");
      return;
    }

    try {
      if (editingProduct) {
        // Update product
        const res = await axios.put(
          `${API_BASE}/products/${editingProduct._id}`,
          productForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addToast("Product updated successfully", "success");
        setEditingProduct(null);
      } else {
        // Create product
        const res = await axios.post(
          `${API_BASE}/products`,
          productForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addToast("Product created successfully", "success");
      }
      
      // Reset form and reload
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        image: "",
        productID: "",
      });
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save product", "error");
    }
  };

  // Select product for editing
  const startEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      image: product.image || "",
      productID: product.productID || "",
    });
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      image: "",
      productID: "",
    });
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const token = getToken();
    try {
      await axios.delete(`${API_BASE}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      addToast("Product deleted successfully", "success");
      fetchProducts();
    } catch (err) {
      addToast("Failed to delete product", "error");
    }
  };

  // Update order status/payment status
  const handleUpdateOrder = async (orderId, updates) => {
    const token = getToken();
    try {
      await axios.put(
        `${API_BASE}/orders/${orderId}/status`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addToast("Order status updated successfully", "success");
      fetchOrders();
    } catch (err) {
      addToast("Failed to update order", "error");
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: "bg-warning text-dark",
      confirmed: "bg-info text-dark",
      processing: "bg-primary text-white",
      shipped: "bg-info text-white",
      delivered: "bg-success text-white",
      cancelled: "bg-danger text-white",
      paid: "bg-success text-white",
      failed: "bg-danger text-white",
    };
    return classes[status] || "bg-secondary text-white";
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Admin Dashboard</h1>
          <p className="text-muted">Manage your store products and client orders.</p>
        </div>
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${activeTab === "products" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveTab("products")}
          >
            Manage Products
          </button>
          <button
            type="button"
            className={`btn ${activeTab === "orders" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveTab("orders")}
          >
            Manage Orders
          </button>
        </div>
      </div>

      {activeTab === "products" ? (
        <div className="row g-4">
          {/* Add / Edit Product Form */}
          <div className="col-lg-4">
            <div className="card shadow-sm p-4">
              <h3 className="h5 mb-3 fw-bold">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <form onSubmit={handleProductSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Product Name *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductChange}
                    placeholder="e.g. Wireless Mouse"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Product ID (SKU) *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="productID"
                    value={productForm.productID}
                    onChange={handleProductChange}
                    placeholder="e.g. MOUSE-101"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Description</label>
                  <textarea
                    className="form-control form-control-sm"
                    name="description"
                    value={productForm.description}
                    onChange={handleProductChange}
                    rows="3"
                    placeholder="Brief description of the product"
                  ></textarea>
                </div>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label small fw-bold">Price (₹) *</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label small fw-bold">Stock Count *</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      name="stock"
                      value={productForm.stock}
                      onChange={handleProductChange}
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Image URL</label>
                  <input
                    type="url"
                    className="form-control form-control-sm"
                    name="image"
                    value={productForm.image}
                    onChange={handleProductChange}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-sm btn-primary w-100">
                    {editingProduct ? "Update Product" : "Create Product"}
                  </button>
                  {editingProduct && (
                    <button type="button" className="btn btn-sm btn-secondary" onClick={cancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Product Listing */}
          <div className="col-lg-8">
            <div className="card shadow-sm p-4">
              <h3 className="h5 mb-3 fw-bold">Products List</h3>
              {loadingProducts ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="alert alert-info">No products found. Add one on the left!</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Product ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p._id}>
                          <td><code>{p.productID || p._id.slice(-8).toUpperCase()}</code></td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={p.image || "https://via.placeholder.com/40?text=No+Img"}
                                alt={p.name}
                                style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = "https://via.placeholder.com/40?text=No+Img";
                                }}
                              />
                              <span className="fw-medium">{p.name}</span>
                            </div>
                          </td>
                          <td>₹{p.price}</td>
                          <td>
                            <span className={`badge ${p.stock > 0 ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                              {p.stock} left
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => startEditProduct(p)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteProduct(p._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Orders Management */
        <div className="card shadow-sm p-4">
          <h3 className="h5 mb-3 fw-bold">All Customer Orders</h3>
          {loadingOrders ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="alert alert-info">No orders found in the system.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment Status</th>
                    <th>Order Status</th>
                    <th>Items</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td><code>{o._id.slice(-8).toUpperCase()}</code></td>
                      <td>
                        <div>
                          <p className="mb-0 fw-medium">{o.user?.name || "Deleted User"}</p>
                          <small className="text-muted">{o.user?.email || ""}</small>
                        </div>
                      </td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="fw-bold">₹{o.totalAmount.toFixed(2)}</td>
                      <td>
                        <select
                          className={`form-select form-select-sm fw-medium ${getStatusBadgeClass(o.paymentStatus)}`}
                          value={o.paymentStatus}
                          onChange={(e) => handleUpdateOrder(o._id, { paymentStatus: e.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className={`form-select form-select-sm fw-medium ${getStatusBadgeClass(o.orderStatus)}`}
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateOrder(o._id, { orderStatus: e.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => {
                            alert(
                              `Shipping details:\nName: ${o.shippingAddress?.name}\nAddress: ${o.shippingAddress?.address}\nCity: ${o.shippingAddress?.city}\n\nItems:\n${o.items
                                .map((item) => `- ${item.name} (Qty: ${item.quantity})`)
                                .join("\n")}`
                            );
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
