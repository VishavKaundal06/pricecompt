const express = require('express');
const { Wishlist, Product, Category, ProductPrice, Store } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// GET /api/wishlist
router.get('/', async (req, res) => {
  try {
    const items = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Product,
        as: 'product',
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] },
          {
            model: ProductPrice,
            as: 'prices',
            include: [{ model: Store, as: 'store', attributes: ['id', 'name', 'slug', 'logo', 'color'] }],
          },
        ],
      }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ wishlist: items });
  } catch (err) {
    console.error('Wishlist error:', err);
    res.status(500).json({ error: 'Server error fetching wishlist.' });
  }
});

// POST /api/wishlist
router.post('/', async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId required.' });

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const [item, created] = await Wishlist.findOrCreate({
      where: { userId: req.user.id, productId },
    });

    res.status(created ? 201 : 200).json({
      message: created ? 'Added to wishlist.' : 'Already in wishlist.',
      item,
    });
  } catch (err) {
    console.error('Add to wishlist error:', err);
    res.status(500).json({ error: 'Server error adding to wishlist.' });
  }
});

// DELETE /api/wishlist/:productId
router.delete('/:productId', async (req, res) => {
  try {
    const deleted = await Wishlist.destroy({
      where: { userId: req.user.id, productId: req.params.productId },
    });
    if (!deleted) return res.status(404).json({ error: 'Item not in wishlist.' });
    res.json({ message: 'Removed from wishlist.' });
  } catch (err) {
    console.error('Remove from wishlist error:', err);
    res.status(500).json({ error: 'Server error removing from wishlist.' });
  }
});

module.exports = router;
