import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import productRoutes from './routes/products.js';
import { setMongoConnected } from './storage/productsStore.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
let isMongoConnected = false;

const mongoUri = process.env.MONGO_URI?.trim() || '';
const hasValidMongoUri = mongoUri && !mongoUri.includes('<db_password>') && !mongoUri.includes('<') && !mongoUri.includes('>');

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  }),
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongoConnected: isMongoConnected,
    storage: isMongoConnected ? 'mongodb' : 'local-file',
  });
});

app.use('/api/products', productRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function connectToMongo() {
  try {
    if (!hasValidMongoUri) {
      console.log('MongoDB URI not configured. Using local file storage.');
      setMongoConnected(false);
      return;
    }

    await mongoose.connect(mongoUri);
    isMongoConnected = true;
    setMongoConnected(true);
    console.log('MongoDB connected');
  } catch (error) {
    isMongoConnected = false;
    setMongoConnected(false);
    console.error('MongoDB connection failed, using local file storage');
    console.error(error);
  }
}

connectToMongo();