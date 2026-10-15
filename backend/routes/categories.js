const express = require('express');
const { Category } = require('../models');

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json({ categories });
  } catch (err) {
    console.error('Categories error:', err);
    res.status(500).json({ error: 'Server error fetching categories.' });
  }
});

module.exports = router;
