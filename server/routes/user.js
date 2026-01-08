const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get user profile
router.get('/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query('SELECT * FROM utilisateur WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    delete user.password_u; // Don't send password
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { name, phone, birth, city, street, country, zip, gender, img } = req.body;
    
    const result = await pool.query(
      `UPDATE utilisateur 
       SET name_u = COALESCE($1, name_u),
           phone = COALESCE($2, phone),
           birth = COALESCE($3, birth),
           city = COALESCE($4, city),
           street = COALESCE($5, street),
           country = COALESCE($6, country),
           zip = COALESCE($7, zip),
           gender = COALESCE($8, gender),
           img = COALESCE($9, img),
           updated_at = CURRENT_TIMESTAMP
       WHERE email = $10 RETURNING *`,
      [name, phone, birth, city, street, country, zip, gender, img, email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    delete user.password_u;
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get opinions/reviews
router.get('/opinions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM opinions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create opinion/review
router.post('/opinions', async (req, res) => {
  try {
    const { idOp, nameU, email, avis, img, userS } = req.body;
    
    const result = await pool.query(
      `INSERT INTO opinions (id_op, name_u, email, avis, img, user_s)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [idOp, nameU, email, avis, img, userS]
    );
    
    res.json({ message: 'Opinion created', opinion: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
