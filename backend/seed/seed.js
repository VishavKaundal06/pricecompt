require('dotenv').config();
const {
  sequelize, User, Category, Store, Product, ProductPrice, PriceHistory, Coupon,
} = require('../models');

const seed = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected. Syncing tables...');
    await sequelize.sync({ force: true });
    console.log('Tables created. Seeding data...');

    // ── Admin User ──
    await User.create({
      name: 'Admin',
      email: 'admin@pricecompt.com',
      password: 'admin123',
      role: 'admin',
    });

    // ── Demo User ──
    await User.create({
      name: 'Demo User',
      email: 'user@pricecompt.com',
      password: 'user123',
      role: 'user',
    });

    console.log('Users created.');

    // ── Categories ──
    const categories = await Category.bulkCreate([
      { name: 'Smartphones', slug: 'smartphones', icon: '📱', description: 'Latest smartphones and mobile devices' },
      { name: 'Laptops', slug: 'laptops', icon: '💻', description: 'Laptops and notebooks for work and gaming' },
      { name: 'Headphones', slug: 'headphones', icon: '🎧', description: 'Headphones, earbuds, and audio accessories' },
      { name: 'Televisions', slug: 'televisions', icon: '📺', description: 'Smart TVs and displays' },
      { name: 'Cameras', slug: 'cameras', icon: '📷', description: 'Digital cameras and photography equipment' },
      { name: 'Tablets', slug: 'tablets', icon: '📋', description: 'Tablets and e-readers' },
      { name: 'Smartwatches', slug: 'smartwatches', icon: '⌚', description: 'Smartwatches and fitness trackers' },
      { name: 'Gaming', slug: 'gaming', icon: '🎮', description: 'Gaming consoles and accessories' },
    ]);
    console.log('Categories created.');

    // ── Stores ──
    const stores = await Store.bulkCreate([
      { name: 'Amazon', slug: 'amazon', url: 'https://www.amazon.in', color: '#FF9900' },
      { name: 'Flipkart', slug: 'flipkart', url: 'https://www.flipkart.com', color: '#2874F0' },
      { name: 'Croma', slug: 'croma', url: 'https://www.croma.com', color: '#00B33C' },
      { name: 'Reliance Digital', slug: 'reliance-digital', url: 'https://www.reliancedigital.in', color: '#E31837' },
      { name: 'Vijay Sales', slug: 'vijay-sales', url: 'https://www.vijaysales.com', color: '#FF6B00' },
    ]);
    console.log('Stores created.');

    // ── Products ──
    const productData = [
      // Smartphones
      {
        name: 'iPhone 15 Pro Max 256GB',
        slug: 'iphone-15-pro-max-256gb',
        description: 'Apple iPhone 15 Pro Max with A17 Pro chip, 48MP camera system, titanium design, USB-C, and all-day battery life.',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
        brand: 'Apple',
        model: 'A3104',
        categoryId: categories[0].id,
        popularity: 95,
        specifications: { display: '6.7" Super Retina XDR', chip: 'A17 Pro', storage: '256GB', ram: '8GB', camera: '48MP + 12MP + 12MP', battery: '4422 mAh' },
        prices: [
          { storeId: stores[0].id, price: 156900, originalPrice: 159900, discount: 1.88, url: 'https://www.amazon.in/dp/B0CHX1W1XY' },
          { storeId: stores[1].id, price: 155990, originalPrice: 159900, discount: 2.44, url: 'https://www.flipkart.com/iphone-15-pro-max' },
          { storeId: stores[2].id, price: 157999, originalPrice: 159900, discount: 1.19, url: 'https://www.croma.com/iphone-15-pro-max' },
        ],
      },
      {
        name: 'Samsung Galaxy S24 Ultra 256GB',
        slug: 'samsung-galaxy-s24-ultra-256gb',
        description: 'Samsung Galaxy S24 Ultra with Snapdragon 8 Gen 3, 200MP camera, S Pen, titanium frame, and Galaxy AI features.',
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
        brand: 'Samsung',
        model: 'SM-S928B',
        categoryId: categories[0].id,
        popularity: 90,
        specifications: { display: '6.8" Dynamic AMOLED 2X', chip: 'Snapdragon 8 Gen 3', storage: '256GB', ram: '12GB', camera: '200MP + 50MP + 12MP + 10MP', battery: '5000 mAh' },
        prices: [
          { storeId: stores[0].id, price: 129999, originalPrice: 134999, discount: 3.70, url: 'https://www.amazon.in/dp/B0CS5XXXX' },
          { storeId: stores[1].id, price: 127999, originalPrice: 134999, discount: 5.19, url: 'https://www.flipkart.com/galaxy-s24-ultra' },
          { storeId: stores[2].id, price: 131999, originalPrice: 134999, discount: 2.22, url: 'https://www.croma.com/galaxy-s24-ultra' },
        ],
      },
      {
        name: 'OnePlus 12 256GB',
        slug: 'oneplus-12-256gb',
        description: 'OnePlus 12 with Snapdragon 8 Gen 3, Hasselblad camera, 100W SUPERVOOC charging, and 2K LTPO display.',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',
        brand: 'OnePlus',
        model: 'CPH2583',
        categoryId: categories[0].id,
        popularity: 82,
        specifications: { display: '6.82" 2K LTPO AMOLED', chip: 'Snapdragon 8 Gen 3', storage: '256GB', ram: '12GB', camera: '50MP + 64MP + 48MP', battery: '5400 mAh' },
        prices: [
          { storeId: stores[0].id, price: 64999, originalPrice: 69999, discount: 7.14, url: 'https://www.amazon.in/dp/B0CXXXX' },
          { storeId: stores[1].id, price: 62999, originalPrice: 69999, discount: 10.00, url: 'https://www.flipkart.com/oneplus-12' },
          { storeId: stores[3].id, price: 66999, originalPrice: 69999, discount: 4.29, url: 'https://www.reliancedigital.in/oneplus-12' },
        ],
      },
      {
        name: 'Google Pixel 8 Pro 128GB',
        slug: 'google-pixel-8-pro-128gb',
        description: 'Google Pixel 8 Pro with Tensor G3 chip, advanced AI features, 50MP triple camera with pro-level controls.',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        brand: 'Google',
        model: 'G1MNW',
        categoryId: categories[0].id,
        popularity: 75,
        specifications: { display: '6.7" LTPO OLED 120Hz', chip: 'Tensor G3', storage: '128GB', ram: '12GB', camera: '50MP + 48MP + 48MP', battery: '5050 mAh' },
        prices: [
          { storeId: stores[0].id, price: 84999, originalPrice: 106999, discount: 20.56, url: 'https://www.amazon.in/dp/B0CGL4XXXX' },
          { storeId: stores[1].id, price: 79999, originalPrice: 106999, discount: 25.23, url: 'https://www.flipkart.com/pixel-8-pro' },
        ],
      },
      // Laptops
      {
        name: 'MacBook Air M3 15-inch 256GB',
        slug: 'macbook-air-m3-15-inch-256gb',
        description: 'Apple MacBook Air with M3 chip, 15.3-inch Liquid Retina display, 18-hour battery, MagSafe charging.',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        brand: 'Apple',
        model: 'MRYQ3HN/A',
        categoryId: categories[1].id,
        popularity: 88,
        specifications: { display: '15.3" Liquid Retina', chip: 'Apple M3', storage: '256GB SSD', ram: '8GB', battery: '18 hours', weight: '1.51 kg' },
        prices: [
          { storeId: stores[0].id, price: 134900, originalPrice: 139900, discount: 3.57, url: 'https://www.amazon.in/dp/B0CX23XXXX' },
          { storeId: stores[1].id, price: 131990, originalPrice: 139900, discount: 5.65, url: 'https://www.flipkart.com/macbook-air-m3' },
          { storeId: stores[2].id, price: 136900, originalPrice: 139900, discount: 2.14, url: 'https://www.croma.com/macbook-air-m3' },
        ],
      },
      {
        name: 'Dell XPS 15 Core i7 16GB 512GB',
        slug: 'dell-xps-15-i7-16gb-512gb',
        description: 'Dell XPS 15 with 13th Gen Intel Core i7, OLED 3.5K display, 16GB RAM, NVIDIA GeForce RTX 4050.',
        image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
        brand: 'Dell',
        model: '9530',
        categoryId: categories[1].id,
        popularity: 78,
        specifications: { display: '15.6" OLED 3.5K', processor: 'Intel Core i7-13700H', storage: '512GB SSD', ram: '16GB DDR5', gpu: 'RTX 4050', weight: '1.86 kg' },
        prices: [
          { storeId: stores[0].id, price: 149990, originalPrice: 174990, discount: 14.29, url: 'https://www.amazon.in/dp/B0BXXXX' },
          { storeId: stores[1].id, price: 152990, originalPrice: 174990, discount: 12.57, url: 'https://www.flipkart.com/dell-xps-15' },
          { storeId: stores[3].id, price: 155990, originalPrice: 174990, discount: 10.86, url: 'https://www.reliancedigital.in/dell-xps' },
        ],
      },
      {
        name: 'ASUS ROG Strix G16 RTX 4060',
        slug: 'asus-rog-strix-g16-rtx-4060',
        description: 'ASUS ROG Strix G16 gaming laptop with Intel Core i7, RTX 4060, 165Hz display, and advanced cooling.',
        image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
        brand: 'ASUS',
        model: 'G614JV',
        categoryId: categories[1].id,
        popularity: 72,
        specifications: { display: '16" FHD+ 165Hz', processor: 'Intel Core i7-13650HX', storage: '1TB SSD', ram: '16GB DDR5', gpu: 'RTX 4060 8GB', weight: '2.5 kg' },
        prices: [
          { storeId: stores[0].id, price: 114990, originalPrice: 139990, discount: 17.86, url: 'https://www.amazon.in/dp/B0CXXXX' },
          { storeId: stores[1].id, price: 109990, originalPrice: 139990, discount: 21.43, url: 'https://www.flipkart.com/asus-rog-strix-g16' },
          { storeId: stores[4].id, price: 119990, originalPrice: 139990, discount: 14.29, url: 'https://www.vijaysales.com/asus-rog' },
        ],
      },
      // Headphones
      {
        name: 'Sony WH-1000XM5 Wireless',
        slug: 'sony-wh-1000xm5-wireless',
        description: 'Sony WH-1000XM5 wireless noise-cancelling headphones with 30-hour battery, LDAC, and Speak-to-Chat.',
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
        brand: 'Sony',
        model: 'WH-1000XM5',
        categoryId: categories[2].id,
        popularity: 85,
        specifications: { driver: '30mm', noise_cancelling: 'Yes (Dual Processor)', battery: '30 hours', bluetooth: '5.3', weight: '250g', codec: 'LDAC, AAC, SBC' },
        prices: [
          { storeId: stores[0].id, price: 26990, originalPrice: 34990, discount: 22.86, url: 'https://www.amazon.in/dp/B09XXXX' },
          { storeId: stores[1].id, price: 25490, originalPrice: 34990, discount: 27.15, url: 'https://www.flipkart.com/sony-xm5' },
          { storeId: stores[2].id, price: 27990, originalPrice: 34990, discount: 20.01, url: 'https://www.croma.com/sony-xm5' },
          { storeId: stores[4].id, price: 26490, originalPrice: 34990, discount: 24.29, url: 'https://www.vijaysales.com/sony-xm5' },
        ],
      },
      {
        name: 'Apple AirPods Pro 2nd Gen',
        slug: 'apple-airpods-pro-2nd-gen',
        description: 'Apple AirPods Pro (2nd generation) with H2 chip, Adaptive Audio, USB-C, and up to 6 hours listening time.',
        image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400',
        brand: 'Apple',
        model: 'MTJV3HN/A',
        categoryId: categories[2].id,
        popularity: 92,
        specifications: { chip: 'H2', noise_cancelling: 'Active', battery: '6h (30h with case)', bluetooth: '5.3', water_resistance: 'IPX4', charging: 'USB-C, MagSafe, Qi' },
        prices: [
          { storeId: stores[0].id, price: 20990, originalPrice: 24900, discount: 15.70, url: 'https://www.amazon.in/dp/B0BDHB9Y8H' },
          { storeId: stores[1].id, price: 19999, originalPrice: 24900, discount: 19.68, url: 'https://www.flipkart.com/airpods-pro-2' },
          { storeId: stores[2].id, price: 21490, originalPrice: 24900, discount: 13.69, url: 'https://www.croma.com/airpods-pro' },
        ],
      },
      // Televisions
      {
        name: 'LG C3 55" 4K OLED evo TV',
        slug: 'lg-c3-55-4k-oled-evo',
        description: 'LG C3 55-inch OLED evo TV with α9 Gen 6 AI Processor 4K, Dolby Vision & Atmos, webOS 23, and 120Hz.',
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
        brand: 'LG',
        model: 'OLED55C3PSA',
        categoryId: categories[3].id,
        popularity: 70,
        specifications: { display: '55" 4K OLED evo', processor: 'α9 Gen 6 AI', refresh_rate: '120Hz', hdr: 'Dolby Vision, HDR10, HLG', sound: '40W 2.2ch', smart_tv: 'webOS 23' },
        prices: [
          { storeId: stores[0].id, price: 119990, originalPrice: 164990, discount: 27.27, url: 'https://www.amazon.in/dp/B0BXXXLG' },
          { storeId: stores[1].id, price: 116990, originalPrice: 164990, discount: 29.09, url: 'https://www.flipkart.com/lg-c3-oled' },
          { storeId: stores[3].id, price: 124990, originalPrice: 164990, discount: 24.24, url: 'https://www.reliancedigital.in/lg-c3' },
        ],
      },
      {
        name: 'Samsung 65" Crystal 4K UHD TV',
        slug: 'samsung-65-crystal-4k-uhd',
        description: 'Samsung 65-inch Crystal 4K UHD Smart TV with Crystal Processor 4K, PurColor, and Smart Hub.',
        image: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=400',
        brand: 'Samsung',
        model: 'UA65CUE60AKLXL',
        categoryId: categories[3].id,
        popularity: 65,
        specifications: { display: '65" Crystal UHD 4K', processor: 'Crystal Processor 4K', refresh_rate: '60Hz', hdr: 'HDR10+', sound: '20W 2ch', smart_tv: 'Tizen' },
        prices: [
          { storeId: stores[0].id, price: 56990, originalPrice: 84990, discount: 32.94, url: 'https://www.amazon.in/dp/B0BXXXSAM' },
          { storeId: stores[1].id, price: 53990, originalPrice: 84990, discount: 36.47, url: 'https://www.flipkart.com/samsung-crystal-4k' },
          { storeId: stores[2].id, price: 58990, originalPrice: 84990, discount: 30.59, url: 'https://www.croma.com/samsung-65' },
          { storeId: stores[4].id, price: 54990, originalPrice: 84990, discount: 35.30, url: 'https://www.vijaysales.com/samsung-65' },
        ],
      },
      // Smartwatches
      {
        name: 'Apple Watch Series 9 GPS 45mm',
        slug: 'apple-watch-series-9-gps-45mm',
        description: 'Apple Watch Series 9 with S9 chip, Double Tap gesture, brighter display, and precision health sensors.',
        image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400',
        brand: 'Apple',
        model: 'MR9A3HN/A',
        categoryId: categories[6].id,
        popularity: 80,
        specifications: { display: '45mm Always-On Retina LTPO', chip: 'S9 SiP', sensors: 'Heart Rate, SpO2, Temperature', water_resistance: 'WR50', battery: '18 hours' },
        prices: [
          { storeId: stores[0].id, price: 41900, originalPrice: 49900, discount: 16.03, url: 'https://www.amazon.in/dp/B0CHXXXAW' },
          { storeId: stores[1].id, price: 39999, originalPrice: 49900, discount: 19.84, url: 'https://www.flipkart.com/apple-watch-9' },
          { storeId: stores[2].id, price: 43900, originalPrice: 49900, discount: 12.02, url: 'https://www.croma.com/apple-watch-9' },
        ],
      },
      // Gaming
      {
        name: 'PlayStation 5 Slim Digital Edition',
        slug: 'ps5-slim-digital-edition',
        description: 'Sony PS5 Slim Digital Edition with custom SSD, DualSense controller, Tempest 3D AudioTech, and 4K gaming.',
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
        brand: 'Sony',
        model: 'CFI-2008A01',
        categoryId: categories[7].id,
        popularity: 87,
        specifications: { cpu: 'AMD Zen 2 8-core', gpu: 'AMD RDNA 2 10.28 TF', storage: '1TB SSD', ram: '16GB GDDR6', resolution: '4K @ 120Hz', controller: 'DualSense' },
        prices: [
          { storeId: stores[0].id, price: 39990, originalPrice: 44990, discount: 11.11, url: 'https://www.amazon.in/dp/B0CXXXPS5' },
          { storeId: stores[1].id, price: 37990, originalPrice: 44990, discount: 15.56, url: 'https://www.flipkart.com/ps5-slim' },
          { storeId: stores[2].id, price: 40990, originalPrice: 44990, discount: 8.89, url: 'https://www.croma.com/ps5' },
          { storeId: stores[3].id, price: 38990, originalPrice: 44990, discount: 13.34, url: 'https://www.reliancedigital.in/ps5' },
        ],
      },
      // Tablets
      {
        name: 'iPad Air M2 11-inch 128GB',
        slug: 'ipad-air-m2-11-inch-128gb',
        description: 'Apple iPad Air with M2 chip, 11-inch Liquid Retina display, Touch ID, Apple Pencil Pro support.',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
        brand: 'Apple',
        model: 'MUWD3HN/A',
        categoryId: categories[5].id,
        popularity: 76,
        specifications: { display: '11" Liquid Retina', chip: 'Apple M2', storage: '128GB', camera: '12MP', battery: '10 hours', weight: '462g' },
        prices: [
          { storeId: stores[0].id, price: 59900, originalPrice: 69900, discount: 14.31, url: 'https://www.amazon.in/dp/B0CXXXIPAD' },
          { storeId: stores[1].id, price: 57990, originalPrice: 69900, discount: 17.04, url: 'https://www.flipkart.com/ipad-air-m2' },
          { storeId: stores[2].id, price: 62900, originalPrice: 69900, discount: 10.01, url: 'https://www.croma.com/ipad-air-m2' },
        ],
      },
      // Camera
      {
        name: 'Sony Alpha A7 IV Body Only',
        slug: 'sony-alpha-a7-iv-body',
        description: 'Sony Alpha 7 IV full-frame mirrorless camera with 33MP, Real-time Eye AF, 4K 60p video, and BIONZ XR.',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
        brand: 'Sony',
        model: 'ILCE-7M4',
        categoryId: categories[4].id,
        popularity: 68,
        specifications: { sensor: '33MP Full Frame CMOS', processor: 'BIONZ XR', video: '4K 60p', af_points: '759 point', iso: '100-51200', stabilization: '5-axis IBIS' },
        prices: [
          { storeId: stores[0].id, price: 198990, originalPrice: 232990, discount: 14.59, url: 'https://www.amazon.in/dp/B09XXXCAM' },
          { storeId: stores[1].id, price: 194990, originalPrice: 232990, discount: 16.31, url: 'https://www.flipkart.com/sony-a7iv' },
          { storeId: stores[2].id, price: 202990, originalPrice: 232990, discount: 12.88, url: 'https://www.croma.com/sony-a7iv' },
        ],
      },
    ];

    // Create products and prices
    for (const data of productData) {
      const { prices: priceRecords, ...productFields } = data;

      const product = await Product.create(productFields);

      // Create prices and price history
      for (const priceData of priceRecords) {
        await ProductPrice.create({
          ...priceData,
          productId: product.id,
          lastCheckedAt: new Date(),
        });

        // Generate price history for the last 90 days
        const now = new Date();
        for (let i = 90; i >= 0; i -= Math.floor(Math.random() * 5) + 3) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);

          // Simulate price fluctuations (±5-15% around current price)
          const basePrice = parseFloat(priceData.price);
          const variation = basePrice * (0.85 + Math.random() * 0.30);
          const historicalPrice = Math.round(variation / 10) * 10 + 9;

          await PriceHistory.create({
            productId: product.id,
            storeId: priceData.storeId,
            price: historicalPrice,
            recordedAt: date,
          });
        }
      }

      // Update product's lowest/highest price
      const priceValues = priceRecords.map(p => p.price);
      product.lowestPrice = Math.min(...priceValues);
      product.highestPrice = Math.max(...priceValues);
      await product.save();
    }

    console.log(`${productData.length} products created with prices and history.`);

    // ── Coupons ──
    await Coupon.bulkCreate([
      { code: 'SAVE10', description: 'Get 10% off on all electronics', discountType: 'percentage', discountValue: 10, minOrder: 5000, maxDiscount: 2000, storeId: stores[0].id, isVerified: true, expiresAt: new Date('2027-03-31'), sourceUrl: 'https://www.amazon.in/coupons' },
      { code: 'FLIP500', description: 'Flat ₹500 off on orders above ₹3000', discountType: 'flat', discountValue: 500, minOrder: 3000, storeId: stores[1].id, isVerified: true, expiresAt: new Date('2027-02-28'), sourceUrl: 'https://www.flipkart.com/offers' },
      { code: 'FIRST15', description: '15% off for first-time buyers on Croma', discountType: 'percentage', discountValue: 15, minOrder: 2000, maxDiscount: 3000, storeId: stores[2].id, isVerified: true, expiresAt: new Date('2027-06-30'), sourceUrl: 'https://www.croma.com' },
      { code: 'MOBILE2K', description: '₹2000 off on smartphones above ₹20000', discountType: 'flat', discountValue: 2000, minOrder: 20000, categoryId: categories[0].id, isVerified: true, expiresAt: new Date('2027-01-31') },
      { code: 'HEADSET20', description: '20% off on headphones', discountType: 'percentage', discountValue: 20, maxDiscount: 5000, categoryId: categories[2].id, isVerified: false, expiresAt: new Date('2027-04-30') },
      { code: 'LAPTOP5K', description: '₹5000 off on laptops above ₹50000', discountType: 'flat', discountValue: 5000, minOrder: 50000, categoryId: categories[1].id, isVerified: true, expiresAt: new Date('2027-05-31') },
      { code: 'SUMMER25', description: '25% off during summer sale (expired demo)', discountType: 'percentage', discountValue: 25, maxDiscount: 10000, isVerified: true, expiresAt: new Date('2025-06-30') },
      { code: 'GAME1000', description: '₹1000 off on gaming products', discountType: 'flat', discountValue: 1000, minOrder: 10000, categoryId: categories[7].id, isVerified: true, expiresAt: new Date('2027-12-31'), storeId: stores[0].id },
    ]);

    console.log('Coupons created.');

    console.log('\n✅ Seed complete!');
    console.log('──────────────────────────');
    console.log('Admin login: admin@pricecompt.com / admin123');
    console.log('User login:  user@pricecompt.com / user123');
    console.log('──────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
