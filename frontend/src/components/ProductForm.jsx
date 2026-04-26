import { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/products';

const initialForm = {
  name: '',
  price: '',
  category: '',
  stock: '0',
};

export default function ProductForm({ onSaved, editProduct, setEditProduct, setStatus }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!editProduct) {
      setForm(initialForm);
      return;
    }

    setForm({
      name: editProduct.name ?? '',
      price: editProduct.price === undefined ? '' : String(editProduct.price),
      category: editProduct.category ?? '',
      stock: editProduct.stock === undefined ? '0' : String(editProduct.stock),
    });
  }, [editProduct]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      stock: Number(form.stock || 0),
    };

    if (Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
      setStatus({ type: 'error', text: 'Price and stock must be valid numbers.' });
      return;
    }

    try {
      if (editProduct) {
        await axios.put(`${API}/${editProduct._id}`, payload);
        setEditProduct(null);
        setStatus({ type: 'success', text: 'Product updated successfully.' });
      } else {
        await axios.post(API, payload);
        setStatus({ type: 'success', text: 'Product added successfully.' });
      }

      setForm(initialForm);
      await onSaved();
    } catch (error) {
      setStatus({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Unable to save product.',
      });
    }
  };

  const handleCancel = () => {
    setEditProduct(null);
    setForm(initialForm);
    setStatus({ type: '', text: '' });
  };

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="card-header">
        <div>
          <p className="eyebrow">Catalog form</p>
          <h2>{editProduct ? 'Edit Product' : 'Add Product'}</h2>
        </div>
        {editProduct && (
          <button type="button" className="button ghost" onClick={handleCancel}>
            Cancel edit
          </button>
        )}
      </div>

      <div className="form-grid">
        <label>
          <span>Name</span>
          <input name="name" placeholder="Laptop" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          <span>Price</span>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="75000"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          <span>Category</span>
          <input
            name="category"
            placeholder="Electronics"
            value={form.category}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          <span>Stock</span>
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            placeholder="10"
            value={form.stock}
            onChange={handleChange}
          />
        </label>
      </div>

      <button type="submit" className="button primary">
        {editProduct ? 'Update Product' : 'Add Product'}
      </button>
    </form>
  );
}