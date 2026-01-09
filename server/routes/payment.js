const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Create payment
router.post('/create', async (req, res) => {
  try {
    const {
      nameC,
      numCompte,
      endC,
      verification,
      emailC,
      valueP,
      typeP,
      userName,
      orderId
    } = req.body;

    const result = await pool.query(
      `INSERT INTO payment (name_c, num_compte, end_c, verification, email_c, value_p, type_p, user_name, order_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [nameC, numCompte, endC, verification, emailC, valueP, typeP, userName, orderId]
    );

    res.json({ message: 'Payment created', payment: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user payments
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(
      'SELECT * FROM payment WHERE user_name = $1 ORDER BY created_at DESC',
      [email]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
