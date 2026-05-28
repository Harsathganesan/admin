const nodemailer = require('nodemailer');

/**
 * Creates an SMTP transporter using credentials from environment variables.
 */
const createTransporter = () => {
    // Check if we have the necessary configuration
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const secure = port === 465; // Port 465 is typically secure (SSL), Port 587 is typically STARTTLS (not secure parameter, but upgrades later)

    if (!user || !pass) {
        console.warn('⚠️ SMTP credentials missing (SMTP_USER/SMTP_PASS). Email sending will be bypassed.');
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass
        },
        tls: {
            rejectUnauthorized: false // Avoid issues with self-signed certs in environments
        }
    });
};

/**
 * Sends a premium email notification to the admin on new order placement.
 * @param {Object} order The order document that was just saved.
 */
const sendOrderNotification = async (order) => {
    try {
        const transporter = createTransporter();
        if (!transporter) {
            console.log('⏭️ Skipping email notification (transporter not configured)');
            return;
        }

        const adminEmail = process.env.ADMIN_EMAIL || 'harsatharts2005@gmail.com';
        const dashboardBaseUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
        
        // Link directly to the order details page using the MongoDB ObjectId
        const orderLink = `${dashboardBaseUrl.replace(/\/$/, '')}/orders/${order._id}`;

        const mailOptions = {
            from: `"HarsathArts9 🎨" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `🎨 New Drawing Order Received! [Order #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}]`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Received</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #0f172a;
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .header {
            text-align: center;
            padding-bottom: 25px;
        }
        .logo-text {
            font-size: 28px;
            font-weight: 800;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            color: #6366f1; /* Fallback */
            display: inline-block;
            letter-spacing: -0.5px;
        }
        .subtitle {
            color: #94a3b8;
            font-size: 14px;
            margin-top: 5px;
        }
        .card {
            background-color: #1e293b;
            border-radius: 16px;
            border: 1px solid #334155;
            padding: 35px 30px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
            text-align: center;
        }
        .banner-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        .title {
            margin: 0 0 10px 0;
            font-size: 22px;
            color: #f1f5f9;
            font-weight: 700;
        }
        .message {
            font-size: 15px;
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .order-id {
            background-color: #0f172a;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 8px 16px;
            font-family: monospace;
            font-size: 14px;
            color: #a855f7;
            display: inline-block;
            margin-top: 5px;
            margin-bottom: 25px;
        }
        .cta-container {
            margin-top: 10px;
            margin-bottom: 10px;
        }
        .btn {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 36px;
            font-size: 15px;
            font-weight: 700;
            border-radius: 9999px;
            display: inline-block;
            box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="logo-text">HarsathArts9</span>
            <div class="subtitle">Premium Artworks & Custom Portraits</div>
        </div>
        
        <div class="card">
            <div class="banner-icon">🎨</div>
            <h1 class="title">New Drawing Order Received!</h1>
            <p class="message">A new drawing request has been placed on your platform. Click below to view the order specifications, reference images, and customer details on your dashboard.</p>
            
            <div>
                <span class="order-id">ID: #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}</span>
            </div>

            <div class="cta-container">
                <a href="${orderLink}" class="btn" target="_blank">Open Dashboard</a>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated system notification from your HarsathArts9 platform.</p>
            <p>&copy; ${new Date().getFullYear()} HarsathArts9. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Notification email sent successfully to ${adminEmail}! Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Error sending order notification email:', error);
    }
};

module.exports = {
    sendOrderNotification
};
