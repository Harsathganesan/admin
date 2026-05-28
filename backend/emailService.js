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

        // Format price nicely
        const formattedPrice = typeof order.price === 'number' 
            ? `₹${order.price.toLocaleString('en-IN')}` 
            : `₹${order.price || 'N/A'}`;

        const mailOptions = {
            from: `"HarsathArts9 🎨" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `🎨 New Order Received! [Order #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}]`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Placed!</title>
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
            padding-bottom: 30px;
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
            padding: 30px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
        }
        .banner {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin-bottom: 25px;
        }
        .banner h1 {
            margin: 0;
            font-size: 20px;
            color: #f1f5f9;
            font-weight: 700;
        }
        .banner p {
            margin: 8px 0 0 0;
            font-size: 14px;
            color: #cbd5e1;
        }
        .section-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6366f1;
            margin-top: 25px;
            margin-bottom: 12px;
            border-bottom: 1px solid #334155;
            padding-bottom: 6px;
        }
        .grid {
            width: 100%;
            border-collapse: collapse;
        }
        .grid td {
            padding: 10px 0;
            vertical-align: top;
        }
        .label {
            color: #94a3b8;
            font-size: 14px;
            width: 35%;
            font-weight: 500;
        }
        .value {
            color: #f1f5f9;
            font-size: 14px;
            font-weight: 600;
            text-align: right;
        }
        .instructions-box {
            background-color: #0f172a;
            border-left: 4px solid #a855f7;
            border-radius: 4px;
            padding: 12px 16px;
            font-size: 14px;
            color: #cbd5e1;
            margin-top: 10px;
            line-height: 1.5;
            font-style: italic;
        }
        .cta-container {
            text-align: center;
            margin-top: 35px;
            margin-bottom: 15px;
        }
        .btn {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
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
        .footer a {
            color: #94a3b8;
            text-decoration: none;
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
            <div class="banner">
                <h1>🎉 New Drawing Request Received!</h1>
                <p>Order ID: <strong>#${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}</strong></p>
            </div>

            <div class="section-title">Customer Details</div>
            <table class="grid">
                <tr>
                    <td class="label">Customer Name</td>
                    <td class="value">${order.customerName || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Email Address</td>
                    <td class="value">${order.customerEmail || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Phone Number</td>
                    <td class="value">${order.customerPhone || 'N/A'}</td>
                </tr>
            </table>

            <div class="section-title">Order Specifications</div>
            <table class="grid">
                <tr>
                    <td class="label">Drawing Type</td>
                    <td class="value">${order.drawingType || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Canvas Size</td>
                    <td class="value">${order.size || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Total Price</td>
                    <td class="value" style="color: #10b981; font-size: 16px; font-weight: 700;">${formattedPrice}</td>
                </tr>
                <tr>
                    <td class="label">Payment Method</td>
                    <td class="value">${order.paymentMethod || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label">Expected Delivery</td>
                    <td class="value">${order.deliveryDate || 'N/A'}</td>
                </tr>
            </table>

            ${order.specialInstructions ? `
                <div class="section-title">Special Instructions</div>
                <div class="instructions-box">
                    "${order.specialInstructions}"
                </div>
            ` : ''}

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
