const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get available tables
router.get('/tables', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM our_tables WHERE statut = 'Free' ORDER BY id_table"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all tables
router.get('/tables/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM our_tables ORDER BY id_table');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create booking
router.post('/create', async (req, res) => {
  try {
    const { nameUser, email, tableId, numberOfPeople, reservationDate, reservationTime } = req.body;

    // Check if user already has a booking
    const existingBooking = await pool.query(
      'SELECT * FROM booking WHERE email = $1 AND status != $2',
      [email, 'cancelled']
    );

    if (existingBooking.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a reservation' });
    }

    // Validate number of people
    if (numberOfPeople > 6) {
      return res.status(400).json({ error: 'Number of people must not exceed 6' });
    }

    // Create booking
    const result = await pool.query(
      `INSERT INTO booking (name_user, email, table_id, number_of_people, reservation_date, reservation_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'confirmed') RETURNING *`,
      [nameUser, email, tableId, numberOfPeople, reservationDate, reservationTime]
    );

    // Update table status
    await pool.query(
      "UPDATE our_tables SET statut = 'Reserved' WHERE id_table = $1",
      [tableId]
    );

    res.json({ message: 'Booking created', booking: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user bookings
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(
      'SELECT * FROM booking WHERE email = $1 ORDER BY reservation_date DESC, reservation_time DESC',
      [email]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel booking
router.put('/cancel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await pool.query('SELECT * FROM booking WHERE id = $1', [id]);
    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await pool.query(
      'UPDATE booking SET status = $1 WHERE id = $2',
      ['cancelled', id]
    );

    // Free the table
    await pool.query(
      "UPDATE our_tables SET statut = 'Free' WHERE id_table = $1",
      [booking.rows[0].table_id]
    );

    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
