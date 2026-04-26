import axios from 'axios';

const API = 'http://localhost:5000/api/products';

export default function ProductList({ products, loading, onDelete, onEdit, setStatus }) {
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      await onDelete();
      setStatus({ type: 'success', text: 'Product deleted successfully.' });
    } catch (error) {
      setStatus({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Unable to delete product.',
      });
    }
  };

  return (
    <section className="card list-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Product List</h2>
        </div>
        <span className="chip">{products.length} items</span>
      </div>

      {loading && <p className="empty-state">Loading products...</p>}
      {!loading && products.length === 0 && <p className="empty-state">No products found.</p>}

      <div className="product-stack">
        {products.map((product) => (
          <article key={product._id} className="product-card">
            <div className="product-main">
              <div>
                <h3>{product.name}</h3>
                <p className="product-meta">Category: {product.category}</p>
              </div>

              <div className="product-price">Rs. {product.price}</div>
            </div>

            <p className="product-meta">Stock: {product.stock}</p>

            <div className="actions">
              <button className="button secondary" type="button" onClick={() => onEdit(product)}>
                Edit
              </button>
              <button className="button danger" type="button" onClick={() => handleDelete(product._id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}