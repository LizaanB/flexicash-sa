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

async function createUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user exists
    const existingUser = await User.findOne({ email: 'Lizaanbotha20@gmail.com' });
    if (existingUser) {
      console.log('User already exists!');
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('test123', salt);

    // Create user
    const user = await User.create({
      name: 'Lizaan',
      email: 'Lizaanbotha20@gmail.com',
      password: hashedPassword,
      phone: '0000000000',
      address: 'South Africa',
      role: 'customer' // Change to 'admin' if you want admin access
    });

    console.log('✅ User created successfully!');
    console.log('Email:', user.email);
    console.log('Password: test123');
    console.log('Role:', user.role);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createUser();
