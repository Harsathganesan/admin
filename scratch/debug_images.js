const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const collection = mongoose.connection.collection('orders');
    const orders = await collection.find({}).toArray();
    console.log(`Total Orders: ${orders.length}`);
    orders.forEach(o => {
      const img = o.referenceImage || "";
      let type = "EMPTY";
      if (img.startsWith("data:")) type = "BASE64";
      else if (img.startsWith("http")) type = "URL";
      else if (img.length > 0) type = "PATH/OTHER";
      
      console.log(`Order: ${o.customerName}, Type: ${type}, Length: ${img.length}, Value: ${img.substring(0, 50)}...`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
