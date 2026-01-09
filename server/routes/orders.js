const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get user orders
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_u = $1 ORDER BY created_at DESC',
      [email]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create order
router.post('/create', async (req, res) => {
  try {
    const { items, userEmail, numCommande } = req.body;
    
    const orderPromises = items.map(item => {
      return pool.query(
        `INSERT INTO orders (name_p, num_commande, quantite, price_u, price, user_u, rate, hour_o)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          item.name_p,
          numCommande,
          item.quantite,
          item.price_u,
          item.price,
          userEmail,
          item.rate || 0,
          new Date().toISOString()
        ]
      );
    });

    const results = await Promise.all(orderPromises);
    res.json({ message: 'Order created', orders: results.map(r => r.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order by number
router.get('/:numCommande', async (req, res) => {
  try {
    const { numCommande } = req.params;
    const result = await pool.query(
      'SELECT * FROM orders WHERE num_commande = $1',
      [numCommande]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
