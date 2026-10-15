const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Store = require('./Store');
const Product = require('./Product');
const ProductPrice = require('./ProductPrice');
const PriceHistory = require('./PriceHistory');
const PriceAlert = require('./PriceAlert');
const Coupon = require('./Coupon');
const Wishlist = require('./Wishlist');
const RecentlyViewed = require('./RecentlyViewed');

// ── Associations ──

// Product <-> Category
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Product <-> ProductPrice <-> Store
Product.hasMany(ProductPrice, { foreignKey: 'productId', as: 'prices' });
ProductPrice.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Store.hasMany(ProductPrice, { foreignKey: 'storeId', as: 'productPrices' });
ProductPrice.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

// Product <-> PriceHistory <-> Store
Product.hasMany(PriceHistory, { foreignKey: 'productId', as: 'priceHistory' });
PriceHistory.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Store.hasMany(PriceHistory, { foreignKey: 'storeId', as: 'priceHistory' });
PriceHistory.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

// User <-> PriceAlert <-> Product
User.hasMany(PriceAlert, { foreignKey: 'userId', as: 'priceAlerts' });
PriceAlert.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(PriceAlert, { foreignKey: 'productId', as: 'priceAlerts' });
PriceAlert.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Coupon <-> Store / Category
Store.hasMany(Coupon, { foreignKey: 'storeId', as: 'coupons' });
Coupon.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
Category.hasMany(Coupon, { foreignKey: 'categoryId', as: 'coupons' });
Coupon.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// User <-> Wishlist <-> Product
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlist' });
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(Wishlist, { foreignKey: 'productId', as: 'wishlists' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// RecentlyViewed <-> Product
Product.hasMany(RecentlyViewed, { foreignKey: 'productId', as: 'recentViews' });
RecentlyViewed.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  sequelize,
  User,
  Category,
  Store,
  Product,
  ProductPrice,
  PriceHistory,
  PriceAlert,
  Coupon,
  Wishlist,
  RecentlyViewed,
};
