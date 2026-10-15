const express = require('express');
const { Op } = require('sequelize');
const { Coupon, Store, Category } = require('../models');

const router = express.Router();

// GET /api/coupons
router.get('/', async (req, res) => {
  try {
    const { category, store, active, page = 1, limit = 20 } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const where = {};

    if (active === 'true') {
      where[Op.or] = [
        { expiresAt: null },
        { expiresAt: { [Op.gt]: new Date() } },
      ];
    }

    if (store) {
      const s = await Store.findOne({ where: { slug: store } });
      if (s) where.storeId = s.id;
    }

    if (category) {
      const c = await Category.findOne({ where: { slug: category } });
      if (c) where.categoryId = c.id;
    }

    const { rows: coupons, count: total } = await Coupon.findAndCountAll({
      where,
      include: [
        { model: Store, as: 'store', attributes: ['id', 'name', 'slug', 'logo', 'color'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] },
      ],
      order: [['isVerified', 'DESC'], ['createdAt', 'DESC']],
      limit: Math.min(parseInt(limit), 50),
      offset,
    });

    res.json({
      coupons,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error('Coupons error:', err);
    res.status(500).json({ error: 'Server error fetching coupons.' });
  }
});

module.exports = router;
