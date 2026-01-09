const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  address: String,
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createTestCustomer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if customer exists
    const existing = await User.findOne({ email: 'customer@test.com' });
    if (existing) {
      console.log('\n✅ Test customer already exists!');
      console.log('Email: customer@test.com');
      console.log('Password: password123');
      console.log('Role:', existing.role);
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create customer
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: hashedPassword,
      phone: '0812345678',
      address: 'Johannesburg, South Africa',
      role: 'customer'
    });

    console.log('\n✅ Test customer created successfully!');
    console.log('Email: customer@test.com');
    console.log('Password: password123');
    console.log('Role:', customer.role);
    console.log('\nNow you can:');
    console.log('1. Logout from admin account');
    console.log('2. Login with: customer@test.com / password123');
    console.log('3. Apply for a loan!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestCustomer();
