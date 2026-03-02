const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const auth = require('../middleware/auth');

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/auth/clients (Admin Only)
router.get('/clients', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    const clients = await User.find({ role: 'CLIENT' }).select('-password');
    res.json(clients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if(!email) return res.status(400).json({ error: 'Email is required' });

  try {
    // Check if email already registered
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Company email already registered' });
    }

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any existing OTPs for this email to prevent spam overrides
    await Otp.deleteMany({ email });

    // Save newly generated OTP to DB
    const newOtp = new Otp({ email, otp: generatedOtp });
    await newOtp.save();

    // ** FOR TESTING: PRINT OTP TO CONSOLE AND RETURN IT ** 
    // Later, connect Nodemailer/Resend here
    console.log(`\n\n======================================`);
    console.log(`🚨 DEVELOPMENT ONLY: Simulated Email`);
    console.log(`To: ${email}`);
    console.log(`Your Voxiq Verification Code is: ${generatedOtp}`);
    console.log(`======================================\n\n`);

    res.status(200).json({ 
        message: 'OTP sent! (Test Mode Active)', 
        testOtp: generatedOtp // Sending to frontend for testing
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { companyName, email, password, otp } = req.body;

  try {
    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Company email already registered' });
    }

    // 2. Verify OTP
    if (!otp) {
        return res.status(400).json({ error: 'Please enter the OTP' });
    }
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user (Give 50 free admin minutes as signup bonus)
    user = new User({
      companyName,
      email,
      password: hashedPassword,
      walletBalance: 0,
      availableMinutes: 50 // Demo minutes
    });

    await user.save();

    // Delete used OTP
    await Otp.deleteOne({ email, otp });

    // 5. Generate JWT
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, companyName: user.companyName, role: user.role } });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user
    let user = await User.findOne({ email });

    // --- FOUNDER FAILSAFE (AUTO-UPGRADE) ---
    if (email === 'imranah310@gmail.com' || email === 'imranaha310@gmail.com') {
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password.trim() || 'admin123', salt);
            user = new User({
                companyName: 'Voxiq HQ',
                email: 'imranah310@gmail.com',
                password: hashedPassword,
                role: 'ADMIN',
                walletBalance: 2500,
                availableMinutes: 500
            });
            await user.save();
        } else if (user.role !== 'ADMIN') {
            user.role = 'ADMIN';
            user.walletBalance = 2500;
            await user.save();
        }
    }
    // ---------------------------------------

    if (!user) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    // 3. Prevent Admin from logging in via Client portal and vice versa
    const isAdminRoute = req.body.isAdminRoute || false;
    
    if (user.role === 'ADMIN' && !isAdminRoute) {
        return res.status(403).json({ error: 'Permission Denied. Admins must login via the HQ Secure Portal.' });
    }
    
    if (user.role === 'CLIENT' && isAdminRoute) {
        return res.status(403).json({ error: 'Permission Denied. Clients cannot access the HQ Portal.' });
    }

    // 4. Generate JWT
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, companyName: user.companyName, role: user.role, walletBalance: user.walletBalance, availableMinutes: user.availableMinutes } });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// PUT /api/auth/update-password
router.put('/update-password', auth, async (req, res) => {
  const { newPassword } = req.body;

  try {
    const sanitizedPassword = newPassword.trim();

    if (!sanitizedPassword || sanitizedPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(sanitizedPassword, salt);

    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/auth/register-admin (Only for Super Admins)
router.post('/register-admin', auth, async (req, res) => {
  const { email, password, companyName } = req.body;

  try {
    // Check if requester is an admin
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Only Admins can create new Admins.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const sanitizedPassword = password.trim();
    const hashedPassword = await bcrypt.hash(sanitizedPassword, salt);

    user = new User({
      companyName: companyName || 'Voxiq Admin',
      email,
      password: hashedPassword,
      role: 'ADMIN',
      walletBalance: 2500, // Pre-fund admin wallet for demos
      availableMinutes: 500
    });

    await user.save();
    res.status(201).json({ message: 'New Admin created successfully!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
