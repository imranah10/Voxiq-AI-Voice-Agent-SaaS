const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('Connected to MongoDB. Deleting existing client account...');
    await User.deleteOne({ email: 'imranah310@gmail.com' });

    console.log('Creating Super Admin account for imranah310@gmail.com...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt); // Pass: admin123

    const adminUser = new User({
        companyName: 'Voxiq HQ',
        email: 'imranah310@gmail.com',
        password: hashedPassword,
        role: 'ADMIN',
        walletBalance: 2500, // Pre-funded Demo Wallet
        availableMinutes: 450 // Demo minutes
    });

    await adminUser.save();
    console.log('✅ Super Admin Created Successfully!');
    console.log('Login Email: imranah310@gmail.com');
    console.log('Password: admin123');
    process.exit(0);
})
.catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
});
