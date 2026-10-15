require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const { startPriceChecker } = require('./jobs/priceChecker');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', apiLimiter);

// Serve uploaded images
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadDir));

// ── Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), mode: 'demo' });
});

// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ──
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models (alter in dev to avoid data loss, but won't create from scratch — use seed for that)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Models synced');
    }

    // Start price checker background job
    startPriceChecker();

    app.listen(PORT, () => {
      console.log(`\n🚀 PriceCompt API running on http://localhost:${PORT}`);
      console.log(`📊 Mode: DEMO (sample data — not live store prices)`);
      console.log(`🔗 Frontend expected at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

start();
