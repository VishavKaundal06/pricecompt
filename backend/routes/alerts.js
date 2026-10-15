const express = require('express');
const { body, validationResult } = require('express-validator');
const { PriceAlert, Product, ProductPrice, Store, Category } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All alert routes require authentication
router.use(authenticate);

// GET /api/alerts — List user's alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await PriceAlert.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Product,
        as: 'product',
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
          {
            model: ProductPrice,
            as: 'prices',
            include: [{ model: Store, as: 'store', attributes: ['id', 'name', 'slug', 'color'] }],
          },
        ],
      }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ alerts });
  } catch (err) {
    console.error('List alerts error:', err);
    res.status(500).json({ error: 'Server error fetching alerts.' });
  }
});

// POST /api/alerts — Create alert
router.post('/', [
  body('productId').isInt(),
  body('targetPrice').isFloat({ min: 0.01 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { productId, targetPrice } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    // Check for existing active alert
    const existing = await PriceAlert.findOne({
      where: { userId: req.user.id, productId, isActive: true },
    });
    if (existing) {
      existing.targetPrice = targetPrice;
      await existing.save();
      return res.json({ alert: existing, message: 'Alert updated.' });
    }

    const alert = await PriceAlert.create({
      userId: req.user.id,
      productId,
      targetPrice,
    });

    res.status(201).json({ alert, message: 'Alert created.' });
  } catch (err) {
    console.error('Create alert error:', err);
    res.status(500).json({ error: 'Server error creating alert.' });
  }
});

// PUT /api/alerts/:id
router.put('/:id', async (req, res) => {
  try {
    const alert = await PriceAlert.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!alert) return res.status(404).json({ error: 'Alert not found.' });

    const { targetPrice, isActive } = req.body;
    if (targetPrice !== undefined) alert.targetPrice = targetPrice;
    if (isActive !== undefined) alert.isActive = isActive;
    await alert.save();

    res.json({ alert, message: 'Alert updated.' });
  } catch (err) {
    console.error('Update alert error:', err);
    res.status(500).json({ error: 'Server error updating alert.' });
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', async (req, res) => {
  try {
    const alert = await PriceAlert.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!alert) return res.status(404).json({ error: 'Alert not found.' });

    await alert.destroy();
    res.json({ message: 'Alert deleted.' });
  } catch (err) {
    console.error('Delete alert error:', err);
    res.status(500).json({ error: 'Server error deleting alert.' });
  }
});

module.exports = router;
