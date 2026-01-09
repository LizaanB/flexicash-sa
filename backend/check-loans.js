const mongoose = require('mongoose');
require('dotenv').config();

const loanSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  status: String,
  createdAt: Date
});

const Loan = mongoose.model('Loan', loanSchema);

async function checkLoans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const loans = await Loan.find({}).populate('customer', 'name email').sort('-createdAt');
    
    console.log(`Total loans: ${loans.length}\n`);
    
    loans.forEach((loan, i) => {
      console.log(`${i + 1}. ${loan.customer?.name || 'Unknown'} (${loan.customer?.email})`);
      console.log(`   Amount: R${loan.amount} | Status: ${loan.status}`);
      console.log(`   Created: ${loan.createdAt}\n`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkLoans();
