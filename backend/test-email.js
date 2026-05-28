const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sendOrderNotification } = require('./emailService');

const runTest = async () => {
    console.log('🚀 Starting Order Email Notification Verification...');
    console.log('--------------------------------------------------');

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass || smtpPass === 'your_gmail_app_password_here') {
        console.log('⚠️  SMTP Configuration is NOT complete yet!');
        console.log(`- SMTP_USER: ${smtpUser || 'Not set'}`);
        console.log(`- SMTP_PASS: ${smtpPass === 'your_gmail_app_password_here' ? 'Using placeholder' : (smtpPass ? 'Set' : 'Not set')}`);
        console.log('');
        console.log('👉 Please edit your "backend/.env" file and set actual SMTP credentials to send the email.');
        console.log('   Gmail App Password Guide: https://support.google.com/accounts/answer/185833');
        console.log('--------------------------------------------------');
        return;
    }

    console.log('✨ Found SMTP Credentials. Preparing mock order data...');
    
    // Create a mock Mongoose-like order document
    const mockOrder = {
        _id: '64f89d8bc3b2f5a898492023',
        orderNumber: 'HA-9824-X',
        customerName: 'Harsath Arts Fan',
        customerEmail: 'customer-test@gmail.com',
        customerPhone: '+91 98765 43210',
        drawingType: 'Detailed Color Portrait Pencil Art',
        size: 'A3 (297 x 420 mm)',
        price: 2500,
        paymentMethod: 'UPI / Online Payment',
        deliveryDate: '2026-06-15',
        specialInstructions: 'Please make the background slightly warmer and emphasize the detailing on the hair.',
        orderDate: new Date().toISOString()
    };

    console.log(`📧 Attempting to send test notification email...`);
    console.log(`   From: ${smtpUser}`);
    console.log(`   To: ${process.env.ADMIN_EMAIL || 'harsatharts2005@gmail.com'}`);
    console.log(`   Dashboard Link Target: ${process.env.DASHBOARD_URL || 'http://localhost:3000'}/orders/${mockOrder._id}`);
    console.log('--------------------------------------------------');

    try {
        await sendOrderNotification(mockOrder);
        console.log('✅ Done! Check your admin email inbox and spam folder to view the premium email template.');
    } catch (err) {
        console.error('❌ Verification failed with error:', err);
    }
};

runTest();
