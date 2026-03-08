const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Otp = require('../models/Otp');
const auth = require('../middleware/auth');

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to 'SendGrid', 'SES', etc.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

// PUT /api/auth/client/:id (Admin Only)
router.put('/client/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const { status } = req.body;
    
    let client = await User.findById(req.params.id);
    if (!client) {
        return res.status(404).json({ error: 'Client not found' });
    }

    if (status !== undefined) client.status = status;

    await client.save();
    res.json({ message: 'Client status updated successfully', client });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE /api/auth/client/:id (Admin Only)
router.delete('/client/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const client = await User.findById(req.params.id);
    if (!client) {
        return res.status(404).json({ error: 'Client not found' });
    }

    // In a real production app, also trigger deletion of Vapi Agents via Vapi API here
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Client permanently deleted.' });
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

    // Check if Email credentials are set up
    const isEmailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

    if (isEmailConfigured) {
        // Send actual email via Nodemailer
        try {
            console.log(`Attempting to send real email to ${email} using ${process.env.EMAIL_USER}...`);
            const mailOptions = {
                from: `"Voxiq HQ" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your Voxiq Verification Code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h2 style="color: #6366f1; text-align: center;">Voxiq</h2>
                        <h3 style="color: #333; text-align: center;">Email Verification</h3>
                        <p style="color: #475569; font-size: 16px;">Hello,</p>
                        <p style="color: #475569; font-size: 16px;">Please use the following 6-digit verification code to complete your registration. This code will expire in 10 minutes.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111; background: #f1f5f9; padding: 15px 30px; border-radius: 8px;">${generatedOtp}</span>
                        </div>
                        <p style="color: #94a3b8; font-size: 14px; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Verification code sent to your email.' });
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
        }
    } else {
        // ** FOR TESTING: PRINT OTP TO CONSOLE AND RETURN IT ** 
        console.log(`\n\n======================================`);
        console.log(`🚨 DEVELOPMENT ONLY: Simulated Email`);
        console.log(`To: ${email}`);
        console.log(`Your Voxiq Verification Code is: ${generatedOtp}`);
        console.log(`WARNING: process.env.EMAIL_USER and EMAIL_PASS are not set.`);
        console.log(`======================================\n\n`);

        res.status(200).json({ 
            message: 'OTP logged to console! (Test Mode Active)', 
            testOtp: generatedOtp // Sending to frontend for testing
        });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// PUT /api/auth/select-plan (For clients saving their selected plan after registration)
router.put('/select-plan', auth, async (req, res) => {
    try {
        const { planName } = req.body;
        
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const formattedPlan = planName.toUpperCase();
        if (!['STARTER', 'PRO', 'ENTERPRISE'].includes(formattedPlan)) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        let allocatedMinutes = 0;
        if (formattedPlan === 'STARTER') allocatedMinutes = 100;
        if (formattedPlan === 'PRO') allocatedMinutes = 500;
        if (formattedPlan === 'ENTERPRISE') allocatedMinutes = 1500;

        user.plan = formattedPlan;
        user.hasSelectedPlan = true;
        user.availableMinutes = allocatedMinutes;
        await user.save();

        // Regenerate JWT to include updated state
        const payload = { user: { id: user.id, role: user.role, hasSelectedPlan: user.hasSelectedPlan } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Send Plan Confirmation Email
        const isEmailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
        if (isEmailConfigured) {
            try {
                const mailOptions = {
                    from: `"Voxiq HQ" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: `Welcome to Voxiq ${formattedPlan}!`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                            <h2 style="color: #6366f1; text-align: center;">Voxiq</h2>
                            <h3 style="color: #333; text-align: center;">Plan Upgraded Successfully</h3>
                            <p style="color: #475569; font-size: 16px;">Hello ${user.companyName},</p>
                            <p style="color: #475569; font-size: 16px;">This email is to confirm that you have successfully selected the <strong>${formattedPlan}</strong> plan.</p>
                            <p style="color: #475569; font-size: 16px;">You can now log in to your dashboard to start creating your AI agents, uploading knowledge bases, and deploying them to your business lines.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #6366f1; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
                            </div>
                            <p style="color: #94a3b8; font-size: 14px; text-align: center;">Thank you for choosing Voxiq!</p>
                        </div>
                    `
                };
                transporter.sendMail(mailOptions).catch(err => console.error("Failed to send plan confirmation email:", err));
            } catch (err) {
                console.error("Error setting up email:", err);
            }
        }

        res.json({ token, user: { id: user.id, companyName: user.companyName, role: user.role, hasSelectedPlan: true, plan: formattedPlan, availableMinutes: user.availableMinutes } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/auth/recharge (Simulate Razorpay/Stripe payment for Wallet)
router.put('/recharge', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid recharge amount' });

        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.walletBalance += Number(amount);
        await user.save();

        res.json({ message: 'Wallet recharged successfully', walletBalance: user.walletBalance });
    } catch (err) {
        console.error(err.message);
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
    const payload = { user: { id: user.id, role: user.role, hasSelectedPlan: user.hasSelectedPlan } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, companyName: user.companyName, role: user.role, hasSelectedPlan: user.hasSelectedPlan } });
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
    const payload = { user: { id: user.id, role: user.role, hasSelectedPlan: user.hasSelectedPlan } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, companyName: user.companyName, role: user.role, walletBalance: user.walletBalance, availableMinutes: user.availableMinutes, hasSelectedPlan: user.hasSelectedPlan } });
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
