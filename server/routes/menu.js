const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all menu items
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 'main' as category, id_p, name_p, price, description, calories, rate, img 
      FROM menus_main
      UNION ALL
      SELECT 'drink' as category, id_p, name_p, price, description, calories, rate, img 
      FROM menus_drinks
      UNION ALL
      SELECT 'pastry' as category, id_p, name_p, price, description, calories, rate, img 
      FROM menus_pastry
      ORDER BY category, name_p
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get main dishes
router.get('/main', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menus_main ORDER BY name_p');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get drinks
router.get('/drinks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menus_drinks ORDER BY name_p');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pastry
router.get('/pastry', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menus_pastry ORDER BY name_p');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get latest items
router.get('/latest', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menus_latest ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get item by ID
router.get('/item/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try main dishes first
    let result = await pool.query('SELECT *, "main" as category FROM menus_main WHERE id_p = $1', [id]);
    
    if (result.rows.length === 0) {
      // Try drinks
      result = await pool.query('SELECT *, "drink" as category FROM menus_drinks WHERE id_p = $1', [id]);
    }
    
    if (result.rows.length === 0) {
      // Try pastry
      result = await pool.query('SELECT *, "pastry" as category FROM menus_pastry WHERE id_p = $1', [id]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update item rating
router.put('/item/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { rate } = req.body;
    
    // Update in appropriate table based on ID range
    if (id.startsWith('1') || id.startsWith('2') || id.startsWith('3') || id.startsWith('4') || 
        id.startsWith('5') || id.startsWith('6') || id.startsWith('7') || id.startsWith('8') || 
        id.startsWith('9') || id.startsWith('10')) {
      await pool.query('UPDATE menus_main SET rate = $1 WHERE id_p = $2', [rate, id]);
    } else if (id.startsWith('3')) {
      await pool.query('UPDATE menus_drinks SET rate = $1 WHERE id_p = $2', [rate, id]);
    } else if (id.startsWith('6')) {
      await pool.query('UPDATE menus_pastry SET rate = $1 WHERE id_p = $2', [rate, id]);
    }
    
    res.json({ message: 'Rating updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
