const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed Admin
    const User = require('../models/User');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@whizpoint.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      console.log('Seeding Admin User...');
      await User.create({
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        verificationStatus: 'Verified'
      });
      console.log('Admin User Created Successfully');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
