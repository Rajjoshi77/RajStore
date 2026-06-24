import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../services/api'
import banner from '../assets/banner.jpg'

const Home = () => {
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get('/products')
        setProducts(response.data)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

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

  const categories = React.useMemo(() => {
    const set = new Set(['All'])
    products.forEach((p) => set.add(getCategory(p)))
    return Array.from(set)
  }, [products])

  const visibleProducts = selectedCategory === 'All' ? products : products.filter(p => getCategory(p) === selectedCategory)

  return (
    <div style={{ padding: '20px' }}>
      {/* Hero Banner */}
      <div style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${banner})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
        padding: '60px 20px',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Welcome to Our Store</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Discover amazing products at great prices</p>
        <Link to="/products" style={{
          backgroundColor: '#fff',
          color: '#333',
          padding: '12px 30px',
          textDecoration: 'none',
          fontWeight: 'bold',
          borderRadius: '4px'
        }}>Shop Now</Link>
      </div>

      {/* Featured Products */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Featured Products</h2>


        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading products...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: selectedCategory === cat ? '2px solid #333' : '1px solid #ddd',
                    background: selectedCategory === cat ? '#333' : '#fff',
                    color: selectedCategory === cat ? '#fff' : '#333',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {visibleProducts.map((product) => (
              <div key={product._id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <img
                  src={product.image || 'https://via.placeholder.com/200'}
                  alt={product.name}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <h3 style={{ fontSize: '1.1rem', margin: '15px 0 10px' }}>{product.name}</h3>
                <p style={{ color: '#333', fontWeight: 'bold' }}>Rs{product.price}</p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>{product.description}</p>
                <Link to={`/products?category=${encodeURIComponent(getCategory(product))}`} style={{
                  display: 'inline-block',
                  marginTop: '10px',
                  backgroundColor: '#333',
                  color: '#fff',
                  padding: '8px 20px',
                  textDecoration: 'none',
                  borderRadius: '4px'
                }}>View Product</Link>
              </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Home
