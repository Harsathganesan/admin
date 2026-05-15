const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Order = mongoose.connection.collection('orders');
        const orders = await Order.find({ referenceImage: { $exists: true, $ne: "" } }).sort({ _id: -1 }).limit(10).toArray();
        
        console.log('Orders with Images:');
        orders.forEach(order => {
            console.log(`ID: ${order._id}, Name: ${order.customerName}, Image: ${order.referenceImage || 'EMPTY'}`);
        });
        
        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
};

checkOrders();
