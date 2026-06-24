import React from "react";
import { Link } from "react-router-dom";

function ProductCardInChat({ product }) {
  if (!product) return null;

  return (
    <div className="cb-product-card">
      {product.image ? (
        <img
          className="cb-product-image"
          src={product.image}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://via.placeholder.com/150?text=No+Image";
          }}
        />
      ) : (
        <div className="cb-product-image cb-product-image--placeholder" />
      )}

      <div className="cb-product-meta">
        <div className="cb-product-name">{product.name}</div>
        <div className="cb-product-desc">{product.description}</div>
        <div className="cb-product-price">
          <strong>{product.price != null ? `₹${product.price.toLocaleString("en-IN")}` : ""}</strong>
        </div>
        <div className="cb-product-stock">{product.stock > 0 ? `In stock: ${product.stock}` : "Out of stock"}</div>

        <Link
          className="cb-product-link"
          to={`/products?search=${encodeURIComponent(product.name)}`}
        >
          View Product
        </Link>
      </div>
    </div>
  );
}

export default ProductCardInChat;

