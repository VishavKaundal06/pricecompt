const express = require('express');
const { Store } = require('../models');

const router = express.Router();

// GET /api/stores
router.get('/', async (req, res) => {
  try {
    const stores = await Store.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
    res.json({ stores });
  } catch (err) {
    console.error('Stores error:', err);
    res.status(500).json({ error: 'Server error fetching stores.' });
  }
});

// GET /api/stores/:slug
router.get('/:slug', async (req, res) => {
  try {
    const store = await Store.findOne({ where: { slug: req.params.slug, isActive: true } });
    if (!store) return res.status(404).json({ error: 'Store not found.' });
    res.json({ store });
  } catch (err) {
    console.error('Store detail error:', err);
    res.status(500).json({ error: 'Server error fetching store.' });
  }
});

module.exports = router;
