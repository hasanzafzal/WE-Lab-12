import { randomUUID } from 'crypto';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');
const dataFile = path.join(dataDir, 'products.json');

let mongoConnected = false;

export function setMongoConnected(value) {
  mongoConnected = value;
}

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(dataFile, 'utf8');
  } catch {
    await writeFile(dataFile, '[]', 'utf8');
  }
}

async function readLocalProducts() {
  await ensureDataFile();
  const raw = await readFile(dataFile, 'utf8');
  return JSON.parse(raw);
}

async function writeLocalProducts(products) {
  await ensureDataFile();
  await writeFile(dataFile, JSON.stringify(products, null, 2), 'utf8');
}

function normalizeProductInput(input) {
  const name = String(input.name ?? '').trim();
  const category = String(input.category ?? '').trim();
  const price = Number(input.price);
  const stock = Number(input.stock ?? 0);

  if (!name) {
    throw new Error('Name is required');
  }

  if (!category) {
    throw new Error('Category is required');
  }

  if (Number.isNaN(price) || price < 0) {
    throw new Error('Price must be a non-negative number');
  }

  if (Number.isNaN(stock) || stock < 0) {
    throw new Error('Stock must be a non-negative number');
  }

  return { name, category, price, stock };
}

async function getMongoProducts() {
  return Product.find().sort({ createdAt: -1 });
}

async function createMongoProduct(input) {
  const product = new Product(normalizeProductInput(input));
  await product.save();
  return product;
}

async function updateMongoProduct(id, input) {
  const updated = await Product.findByIdAndUpdate(id, normalizeProductInput(input), {
    new: true,
    runValidators: true,
  });

  return updated;
}

async function deleteMongoProduct(id) {
  return Product.findByIdAndDelete(id);
}

export async function getProducts() {
  if (mongoConnected) {
    return getMongoProducts();
  }

  const products = await readLocalProducts();
  return products.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

export async function createProduct(input) {
  if (mongoConnected) {
    return createMongoProduct(input);
  }

  const products = await readLocalProducts();
  const product = {
    _id: randomUUID(),
    ...normalizeProductInput(input),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.unshift(product);
  await writeLocalProducts(products);
  return product;
}

export async function updateProduct(id, input) {
  if (mongoConnected) {
    return updateMongoProduct(id, input);
  }

  const products = await readLocalProducts();
  const index = products.findIndex((product) => product._id === id);

  if (index === -1) {
    return null;
  }

  const product = products[index];
  const updatedProduct = {
    ...product,
    ...normalizeProductInput(input),
    updatedAt: new Date().toISOString(),
  };

  products[index] = updatedProduct;
  await writeLocalProducts(products);
  return updatedProduct;
}

export async function deleteProduct(id) {
  if (mongoConnected) {
    return deleteMongoProduct(id);
  }

  const products = await readLocalProducts();
  const index = products.findIndex((product) => product._id === id);

  if (index === -1) {
    return null;
  }

  const [deletedProduct] = products.splice(index, 1);
  await writeLocalProducts(products);
  return deletedProduct;
}