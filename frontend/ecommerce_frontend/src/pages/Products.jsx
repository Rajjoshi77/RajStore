import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

function Products() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [sort, setSort] = useState("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('')

  
  const addCart = (product) => {
    const qty = quantities[product._id] || 1;
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item._id === product._id);
      let updatedCart;
      if (existingIndex >= 0) {
        updatedCart = prevCart.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: (item.quantity || 1) + qty } : item
        );
      } else {
        updatedCart = [...prevCart, { ...product, quantity: qty }];
      }
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
      return updatedCart;
    });
    addToast(`${product.name} added to cart!`, "success");
  };

  const loadProducts = (query, category = '', sortBy = 'default', minPriceVal = '', maxPriceVal = '', inStock = false) => {
    setLoading(true);
    let endpoint = "/products";
    const params = new URLSearchParams();

    if (query) params.append('search', query);
    if (sortBy && sortBy !== 'default') params.append('sort', sortBy);
    if (minPriceVal) params.append('minPrice', minPriceVal);
    if (maxPriceVal) params.append('maxPrice', maxPriceVal);
    if (inStock) params.append('inStock', true);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    API.get(endpoint)
      .then((res) => {
        let items = res.data;
        if (category) {
          items = items.filter(p => getCategory(p) === category)
        }
        setProducts(items)
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  const getCategory = (product) => {
    const name = (product.name || '').toLowerCase()
    if (/laptop|ssd|printer|monitor|keyboard|mouse/.test(name)) return 'Computers'
    if (/phone|smartphone|tablet|mobile/.test(name)) return 'Mobile'
    if (/headphone|speaker|microphone|webcam/.test(name)) return 'Audio'
    if (/watch/.test(name)) return 'Wearables'
    if (/bag|backpack/.test(name)) return 'Accessories'
    if (/camera/.test(name)) return 'Camera'
    if (/shoes/.test(name)) return 'Shoes'
    if (/gaming|chair/.test(name)) return 'Gaming'
    return 'Other'
  }

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);

    const handleStorageChange = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCart(updatedCart);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";
    const category = params.get('category') || ''
    setSelectedCategory(category)
    setSearchTerm(query);
    loadProducts(query, category, sort, minPrice, maxPrice, inStockOnly);
  }, [location.search]);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/products");
    }
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSort(newSort);
    loadProducts(searchTerm, selectedCategory, newSort, minPrice, maxPrice, inStockOnly);
  };

  const handleFilterChange = () => {
    loadProducts(searchTerm, selectedCategory, sort, minPrice, maxPrice, inStockOnly);
  };

  const handleMinPriceChange = (e) => {
    setMinPrice(e.target.value);
  };

  const handleMaxPriceChange = (e) => {
    setMaxPrice(e.target.value);
  };

  const handleStockFilterChange = (e) => {
    setInStockOnly(e.target.checked);
    loadProducts(searchTerm, selectedCategory, sort, minPrice, maxPrice, e.target.checked);
  };

  const resetFilters = () => {
    setSort("default");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    loadProducts(searchTerm, selectedCategory, 'default', '', '', false);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex flex-column flex-md-row align-items-start justify-content-between mb-4 gap-3">
        <div>
          <h2>Products</h2>
          {selectedCategory ? (
            <p className="text-muted">Category: {selectedCategory} <button className="btn btn-sm btn-link" onClick={() => navigate('/products')}>Show all</button></p>
          ) : searchTerm ? (
            <p className="text-muted">Showing results for "{searchTerm}"</p>
          ) : (
            <p className="text-muted">Browse our full collection or search by name.</p>
          )}
        </div>
        <form className="d-flex gap-2" onSubmit={handleSearch}>
          <input
            type="text"
            className="form-control"
            placeholder="Search products"
            aria-label="Search products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {/* Sort and Filter Section */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card p-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-2">
                <label className="form-label">Sort By</label>
                <select 
                  className="form-select" 
                  value={sort} 
                  onChange={handleSortChange}
                >
                  <option value="default">Default</option>
                  <option value="price_low_to_high">Price: Low to High</option>
                  <option value="price_high_to_low">Price: High to Low</option>
                  <option value="name_a_to_z">Name: A to Z</option>
                  <option value="name_z_to_a">Name: Z to A</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Min Price (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  min="0"
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Max Price (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  min="0"
                />
              </div>

              <div className="col-md-2">
                <div className="form-check mt-4">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="inStock"
                    checked={inStockOnly}
                    onChange={handleStockFilterChange}
                  />
                  <label className="form-check-label" htmlFor="inStock">
                    In Stock Only
                  </label>
                </div>
              </div>

              <div className="col-md-2">
                <button 
                  className="btn btn-secondary w-100" 
                  onClick={handleFilterChange}
                >
                  Apply Filter
                </button>
              </div>

              <div className="col-md-2">
                <button 
                  className="btn btn-outline-secondary w-100" 
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="alert alert-info">No products matched your search.</div>
      ) : (
        <div className="row">
          {products.map((product) => (
            <div className="col-md-4 mb-3" key={product._id}>
              <div className="card">
                <img
                  src={product.image || "https://via.placeholder.com/250?text=No+Image"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://via.placeholder.com/250?text=No+Image";
                  }}
                  className="card-img-top"
                  alt={product.name}
                  style={{ height: "250px", objectFit: "cover" }}
                />

                <div className="card-body">
                  <h5>{product.name}</h5>
                  <p>₹{product.price}</p>
                  <div className="d-flex align-items-center gap-2 mt-2">
                    <label className="small">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-control form-control-sm"
                      style={{ width: "60px" }}
                      value={quantities[product._id] || 1}
                      onChange={(e) => setQuantities({ ...quantities, [product._id]: parseInt(e.target.value) || 1 })}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="card-footer">
                  <button className="btn btn-primary w-100" onClick={() => addCart(product)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;