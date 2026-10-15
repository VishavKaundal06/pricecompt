const express = require('express');
const { Op } = require('sequelize');
const { Product, Category, ProductPrice, Store, PriceHistory, RecentlyViewed } = require('../models');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/products — Search & list products
router.get('/', async (req, res) => {
  try {
    const {
      q,           // search query
      category,    // category slug
      brand,
      minPrice,
      maxPrice,
      store,       // store slug
      sort = 'popularity', // popularity | price_asc | price_desc | discount | newest
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const productWhere = { isActive: true };
    const priceWhere = {};

    // Text search
    if (q) {
      productWhere[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { brand: { [Op.iLike]: `%${q}%` } },
        { model: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
      ];
    }

    // Category filter
    if (category) {
      const cat = await Category.findOne({ where: { slug: category } });
      if (cat) productWhere.categoryId = cat.id;
    }

    // Brand filter
    if (brand) {
      productWhere.brand = { [Op.iLike]: `%${brand}%` };
    }

    // Price range filter
    if (minPrice) productWhere.lowestPrice = { ...productWhere.lowestPrice, [Op.gte]: parseFloat(minPrice) };
    if (maxPrice) productWhere.lowestPrice = { ...productWhere.lowestPrice, [Op.lte]: parseFloat(maxPrice) };

    // Sorting
    let order = [['popularity', 'DESC']];
    switch (sort) {
      case 'price_asc': order = [['lowestPrice', 'ASC NULLS LAST']]; break;
      case 'price_desc': order = [['lowestPrice', 'DESC NULLS LAST']]; break;
      case 'newest': order = [['createdAt', 'DESC']]; break;
      case 'discount': order = [['lowestPrice', 'ASC NULLS LAST']]; break;
      default: order = [['popularity', 'DESC']];
    }

    const { rows: products, count: total } = await Product.findAndCountAll({
      where: productWhere,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] },
        {
          model: ProductPrice,
          as: 'prices',
          include: [{ model: Store, as: 'store', attributes: ['id', 'name', 'slug', 'logo', 'color'] }],
          order: [['price', 'ASC']],
        },
      ],
      order,
      limit: Math.min(parseInt(limit), 50),
      offset,
      distinct: true,
    });

    // If store filter, further filter in application layer
    let filtered = products;
    if (store) {
      filtered = products.filter(p =>
        p.prices.some(pr => pr.store && pr.store.slug === store)
      );
    }

    res.json({
      products: filtered,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Product list error:', err);
    res.status(500).json({ error: 'Server error fetching products.' });
  }
});

// GET /api/products/trending
router.get('/trending', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] },
        {
          model: ProductPrice,
          as: 'prices',
          include: [{ model: Store, as: 'store', attributes: ['id', 'name', 'slug', 'logo', 'color'] }],
        },
      ],
      order: [['popularity', 'DESC']],
      limit: 12,
    });
    res.json({ products });
  } catch (err) {
    console.error('Trending error:', err);
    res.status(500).json({ error: 'Server error fetching trending products.' });
  }
});

// GET /api/products/deals — Products with biggest discounts
router.get('/deals', async (req, res) => {
  try {
    const { category, store, page = 1, limit = 20 } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const priceWhere = { discount: { [Op.gt]: 0 }, isAvailable: true };
    const storeInclude = { model: Store, as: 'store', attributes: ['id', 'name', 'slug', 'logo', 'color'] };

    if (store) {
      const s = await Store.findOne({ where: { slug: store } });
      if (s) priceWhere.storeId = s.id;
    }

    const productWhere = { isActive: true };
    if (category) {
      const cat = await Category.findOne({ where: { slug: category } });
      if (cat) productWhere.categoryId = cat.id;
    }

    const { rows: products, count: total } = await Product.findAndCountAll({
      where: productWhere,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] },
        {
          model: ProductPrice,
          as: 'prices',
          where: priceWhere,
          include: [storeInclude],
        },
      ],
      order: [[{ model: ProductPrice, as: 'prices' }, 'discount', 'DESC']],
      limit: Math.min(parseInt(limit), 50),
      offset,
      distinct: true,
    });

    res.json({
      products,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error('Deals error:', err);
    res.status(500).json({ error: 'Server error fetching deals.' });
  }
});

// GET /api/products/recently-viewed
router.get('/recently-viewed', async (req, res) => {
  try {
    const visitorId = req.query.visitorId;
    if (!visitorId) return res.json({ products: [] });

    const recent = await RecentlyViewed.findAll({
      where: { visitorId },
      include: [{
        model: Product,
        as: 'product',
        where: { isActive: true },
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] },
          {
            model: ProductPrice,
            as: 'prices',
            include: [{ model: Store, as: 'store', attributes: ['id', 'name', 'slug', 'logo', 'color'] }],
          },
        ],
      }],
      order: [['viewedAt', 'DESC']],
      limit: 10,
    });

    res.json({ products: recent.map(r => r.product) });
  } catch (err) {
    console.error('Recently viewed error:', err);
    res.status(500).json({ error: 'Server error fetching recently viewed.' });
  }
});

// POST /api/products/recently-viewed
router.post('/recently-viewed', async (req, res) => {
  try {
    const { visitorId, productId } = req.body;
    if (!visitorId || !productId) {
      return res.status(400).json({ error: 'visitorId and productId required.' });
    }

    // Upsert
    const existing = await RecentlyViewed.findOne({ where: { visitorId, productId } });
    if (existing) {
      existing.viewedAt = new Date();
      await existing.save();
    } else {
      await RecentlyViewed.create({ visitorId, productId });
    }

    // Keep only last 20
    const all = await RecentlyViewed.findAll({
      where: { visitorId },
      order: [['viewedAt', 'DESC']],
    });
    if (all.length > 20) {
      const toDelete = all.slice(20).map(r => r.id);
      await RecentlyViewed.destroy({ where: { id: toDelete } });
    }

    res.json({ message: 'Recorded.' });
  } catch (err) {
    console.error('Record view error:', err);
    res.status(500).json({ error: 'Server error recording view.' });
  }
});

// GET /api/products/:slug — Single product detail
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { slug: req.params.slug, isActive: true },
      include: [
        { model: Category, as: 'category' },
        {
          model: ProductPrice,
          as: 'prices',
          include: [{ model: Store, as: 'store' }],
          order: [['price', 'ASC']],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Increment popularity
    await product.increment('popularity');

    // Get price history
    const priceHistory = await PriceHistory.findAll({
      where: { productId: product.id },
      include: [{ model: Store, as: 'store', attributes: ['id', 'name', 'slug', 'color'] }],
      order: [['recordedAt', 'ASC']],
    });

    res.json({ product, priceHistory });
  } catch (err) {
    console.error('Product detail error:', err);
    res.status(500).json({ error: 'Server error fetching product.' });
  }
});

module.exports = router;
