const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, gender, phone, birth, city, street, country, zip } = req.body;

    // Validate password
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)) {
      return res.status(400).json({ 
        error: 'Password must contain uppercase, lowercase, number and 8+ characters' 
      });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM utilisateur WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000);

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirmation of your account',
      text: `Here is the code to confirm your account: ${code}`,
    };

    await transporter.sendMail(mailOptions);

    // Store user data temporarily (in production, use Redis or database)
    // For now, we'll create the user but mark as unverified
    const result = await pool.query(
      `INSERT INTO utilisateur (name_u, email, password_u, gender, phone, birth, city, street, country, zip)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, email, hashedPassword, gender, phone, birth, city, street, country, zip]
    );

    res.json({ 
      message: 'Verification code sent to email',
      code: code, // Remove in production
      userId: result.rows[0].id_u 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify email
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    // In production, verify code from database/Redis
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM utilisateur WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_u);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update connected users
    await pool.query(
      'INSERT INTO connected_u (email, temps) VALUES ($1, $2)',
      [email, new Date().toISOString()]
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id_u, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id_u,
        name: user.name_u,
        email: user.email,
        phone: user.phone,
        img: user.img,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { email } = req.body;
    await pool.query('DELETE FROM connected_u WHERE email = $1', [email]);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query('SELECT * FROM utilisateur WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Recovery',
      text: `Your recovery code is: ${code}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Recovery code sent', code: code }); // Remove code in production
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    // Verify code (in production, check from database)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await pool.query(
      'UPDATE utilisateur SET password_u = $1 WHERE email = $2',
      [hashedPassword, email]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
