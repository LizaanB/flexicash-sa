const mongoose = require('mongoose');
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

async function updateToAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email: 'Lizaanbotha20@gmail.com' },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log('✅ User updated to admin successfully!');
      console.log('Email:', user.email);
      console.log('Role:', user.role);
    } else {
      console.log('❌ User not found');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateToAdmin();
