const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { PriceAlert, Product, ProductPrice, User } = require('../models');

let transporter = null;

// Initialize email transporter if SMTP credentials are set
const initTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('[PriceChecker] Email transporter configured.');
  } else {
    console.log('[PriceChecker] No SMTP credentials — email notifications disabled (will log to console instead).');
  }
};

const checkPriceAlerts = async () => {
  console.log(`[PriceChecker] Running at ${new Date().toISOString()}`);

  try {
    const activeAlerts = await PriceAlert.findAll({
      where: { isActive: true },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        {
          model: Product, as: 'product',
          include: [{
            model: ProductPrice, as: 'prices',
            where: { isAvailable: true },
          }],
        },
      ],
    });

    let notificationCount = 0;

    for (const alert of activeAlerts) {
      if (!alert.product || !alert.product.prices || alert.product.prices.length === 0) continue;

      const lowestPrice = Math.min(...alert.product.prices.map(p => parseFloat(p.price)));

      // Check if price has dropped to or below target
      if (lowestPrice <= parseFloat(alert.targetPrice)) {
        // Prevent duplicate notifications for the same price
        if (alert.lastNotifiedPrice && parseFloat(alert.lastNotifiedPrice) === lowestPrice) {
          continue;
        }

        // Send notification
        const message = {
          to: alert.user.email,
          subject: `🎉 Price Drop Alert: ${alert.product.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6366f1;">Price Drop Alert!</h2>
              <p>Hi ${alert.user.name},</p>
              <p>Great news! The price for <strong>${alert.product.name}</strong> has dropped to your target price.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 8px; border: 1px solid #ddd;">Your Target Price</td><td style="padding: 8px; border: 1px solid #ddd;">₹${alert.targetPrice}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;">Current Lowest Price</td><td style="padding: 8px; border: 1px solid #ddd; color: #16a34a; font-weight: bold;">₹${lowestPrice}</td></tr>
              </table>
              <p style="color: #666; font-size: 12px;">This is a demo notification from PriceCompt.</p>
            </div>
          `,
        };

        if (transporter) {
          try {
            await transporter.sendMail({ from: process.env.SMTP_USER, ...message });
            console.log(`[PriceChecker] Email sent to ${alert.user.email} for product ${alert.product.name}`);
          } catch (emailErr) {
            console.error(`[PriceChecker] Email failed for ${alert.user.email}:`, emailErr.message);
          }
        } else {
          console.log(`[PriceChecker] Would notify ${alert.user.email}: ${alert.product.name} is now ₹${lowestPrice} (target: ₹${alert.targetPrice})`);
        }

        // Update alert to prevent duplicates
        alert.lastNotifiedAt = new Date();
        alert.lastNotifiedPrice = lowestPrice;
        await alert.save();
        notificationCount++;
      }
    }

    console.log(`[PriceChecker] Complete. ${notificationCount} notification(s) sent.`);
  } catch (err) {
    console.error('[PriceChecker] Error:', err);
  }
};

const startPriceChecker = () => {
  initTransporter();

  // Run every 30 minutes
  cron.schedule('*/30 * * * *', checkPriceAlerts);
  console.log('[PriceChecker] Scheduled to run every 30 minutes.');

  // Also run once on startup after a delay
  setTimeout(checkPriceAlerts, 10000);
};

module.exports = { startPriceChecker, checkPriceAlerts };
