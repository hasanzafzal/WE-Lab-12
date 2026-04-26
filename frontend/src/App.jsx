import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';

const API = 'http://localhost:5000/api/products';

export default function App() {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(API);
      setProducts(response.data);
    } catch (error) {
      setStatus({ type: 'error', text: 'Could not load products from the server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!status.text) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setStatus({ type: '', text: '' });
    }, 3000);

    return () => clearTimeout(timer);
  }, [status]);

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">MERN Lab 12</p>
          <h1>Product Manager</h1>
          <p className="hero-copy">
            Connect a React frontend to an Express and MongoDB backend with full CRUD support.
          </p>
        </div>

        <div className="hero-stats">
          <article>
            <strong>{products.length}</strong>
            <span>Products loaded</span>
          </article>
          <article>
            <strong>CRUD</strong>
            <span>Create, read, update, delete</span>
          </article>
        </div>
      </section>

      <section className="content-panel">
        {status.text && <div className={`status-banner ${status.type}`}>{status.text}</div>}

        <ProductForm
          onSaved={fetchProducts}
          editProduct={editProduct}
          setEditProduct={setEditProduct}
          setStatus={setStatus}
        />

        <ProductList
          products={products}
          loading={loading}
          onDelete={fetchProducts}
          onEdit={setEditProduct}
          setStatus={setStatus}
        />
      </section>
    </main>
  );
}