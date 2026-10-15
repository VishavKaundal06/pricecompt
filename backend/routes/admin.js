const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const {
  Product, Category, Store, ProductPrice, PriceHistory,
  Coupon, User, PriceAlert,
} = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// ── Image Upload ──
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    if (!allowed.includes(ext.toLowerCase())) {
      return cb(new Error('Invalid image format. Allowed: jpg, png, webp, gif, svg'));
    }
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/admin/upload
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl, message: 'Image uploaded successfully.' });
});

// ── Dashboard Stats ──
router.get('/stats', async (req, res) => {
  try {
    const [products, stores, users, alerts, coupons] = await Promise.all([
      Product.count(),
      Store.count(),
      User.count(),
      PriceAlert.count({ where: { isActive: true } }),
      Coupon.count(),
    ]);
    res.json({ stats: { products, stores, users, alerts, coupons } });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error fetching stats.' });
  }
});

// ══════════════════════════════
// ── PRODUCTS ──
// ══════════════════════════════

// GET /api/admin/products
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const where = {};
    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { brand: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const { rows: products, count: total } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        {
          model: ProductPrice, as: 'prices',
          include: [{ model: Store, as: 'store', attributes: ['id', 'name'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    res.json({ products, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    console.error('Admin products error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/admin/products
router.post('/products', [
  body('name').trim().notEmpty().withMessage('Product name required'),
  body('categoryId').optional().isInt(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description, image, brand, model, specifications, categoryId } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const product = await Product.create({
      name, slug, description, image, brand, model,
      specifications: specifications || {},
      categoryId: categoryId || null,
    });

    res.status(201).json({ product, message: 'Product created.' });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Server error creating product.' });
  }
});

// PUT /api/admin/products/:id
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const { name, description, image, brand, model, specifications, categoryId, isActive } = req.body;
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image;
    if (brand !== undefined) product.brand = brand;
    if (model !== undefined) product.model = model;
    if (specifications !== undefined) product.specifications = specifications;
    if (categoryId !== undefined) product.categoryId = categoryId;
    if (isActive !== undefined) product.isActive = isActive;
    await product.save();

    res.json({ product, message: 'Product updated.' });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Server error updating product.' });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    product.isActive = false;
    await product.save();
    res.json({ message: 'Product deactivated.' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ══════════════════════════════
// ── CATEGORIES ──
// ══════════════════════════════

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/categories', [
  body('name').trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, icon, description, image } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await Category.create({ name, slug, icon, description, image });
    res.status(201).json({ category, message: 'Category created.' });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found.' });

    const { name, icon, description, image } = req.body;
    if (name !== undefined) { category.name = name; category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
    if (icon !== undefined) category.icon = icon;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    await category.save();

    res.json({ category, message: 'Category updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await Category.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ══════════════════════════════
// ── STORES ──
// ══════════════════════════════

router.get('/stores', async (req, res) => {
  try {
    const stores = await Store.findAll({ order: [['name', 'ASC']] });
    res.json({ stores });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/stores', [
  body('name').trim().notEmpty(),
  body('url').trim().isURL(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, url, logo, color } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const store = await Store.create({ name, slug, url, logo, color });
    res.status(201).json({ store, message: 'Store created.' });
  } catch (err) {
    console.error('Create store error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/stores/:id', async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ error: 'Store not found.' });

    const { name, url, logo, color, isActive } = req.body;
    if (name !== undefined) { store.name = name; store.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
    if (url !== undefined) store.url = url;
    if (logo !== undefined) store.logo = logo;
    if (color !== undefined) store.color = color;
    if (isActive !== undefined) store.isActive = isActive;
    await store.save();

    res.json({ store, message: 'Store updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.delete('/stores/:id', async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ error: 'Store not found.' });
    store.isActive = false;
    await store.save();
    res.json({ message: 'Store deactivated.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ══════════════════════════════
// ── PRICES ──
// ══════════════════════════════

// POST /api/admin/prices — Add or update a product price
router.post('/prices', [
  body('productId').isInt(),
  body('storeId').isInt(),
  body('price').isFloat({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { productId, storeId, price, originalPrice, discount, url, isAvailable } = req.body;

    // Upsert price
    let [productPrice, created] = await ProductPrice.findOrCreate({
      where: { productId, storeId },
      defaults: { price, originalPrice, discount, url, isAvailable, lastCheckedAt: new Date() },
    });

    if (!created) {
      productPrice.price = price;
      if (originalPrice !== undefined) productPrice.originalPrice = originalPrice;
      if (discount !== undefined) productPrice.discount = discount;
      if (url !== undefined) productPrice.url = url;
      if (isAvailable !== undefined) productPrice.isAvailable = isAvailable;
      productPrice.lastCheckedAt = new Date();
      await productPrice.save();
    }

    // Record in price history
    await PriceHistory.create({
      productId,
      storeId,
      price,
      recordedAt: new Date(),
    });

    // Update product's lowest/highest price
    const allPrices = await ProductPrice.findAll({
      where: { productId, isAvailable: true },
      attributes: ['price'],
    });
    if (allPrices.length > 0) {
      const priceValues = allPrices.map(p => parseFloat(p.price));
      const product = await Product.findByPk(productId);
      product.lowestPrice = Math.min(...priceValues);
      product.highestPrice = Math.max(...priceValues);
      await product.save();
    }

    res.json({ productPrice, message: created ? 'Price created.' : 'Price updated.' });
  } catch (err) {
    console.error('Price update error:', err);
    res.status(500).json({ error: 'Server error updating price.' });
  }
});

// GET /api/admin/price-history
router.get('/price-history', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const { rows: history, count: total } = await PriceHistory.findAndCountAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Store, as: 'store', attributes: ['id', 'name'] },
      ],
      order: [['recordedAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ history, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ══════════════════════════════
// ── COUPONS ──
// ══════════════════════════════

router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      include: [
        { model: Store, as: 'store', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ coupons });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/coupons', [
  body('code').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('discountValue').isFloat({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const coupon = await Coupon.create(req.body);
    res.status(201).json({ coupon, message: 'Coupon created.' });
  } catch (err) {
    console.error('Create coupon error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/coupons/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found.' });

    Object.assign(coupon, req.body);
    await coupon.save();

    res.json({ coupon, message: 'Coupon updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    await Coupon.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Coupon deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ══════════════════════════════
// ── USERS (admin view) ──
// ══════════════════════════════

router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
