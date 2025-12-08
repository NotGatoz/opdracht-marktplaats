const { pool } = require('../lib/db');

async function addTestBids() {
  try {
    // First, get some opdrachten ids
    const opdrachtenResult = await pool.query('SELECT id FROM opdrachten LIMIT 5');
    const opdrachtenIds = opdrachtenResult.rows.map(row => row.id);

    if (opdrachtenIds.length === 0) {
      console.log('No opdrachten found to add bids to.');
      return;
    }

    // Get some user ids
    const usersResult = await pool.query('SELECT id FROM users LIMIT 5');
    const userIds = usersResult.rows.map(row => row.id);

    if (userIds.length === 0) {
      console.log('No users found to add bids from.');
      return;
    }

    // Add some test bids
    for (let i = 0; i < Math.min(opdrachtenIds.length, userIds.length); i++) {
      const opdrachtId = opdrachtenIds[i];
      const userId = userIds[i];
      const amount = Math.floor(Math.random() * 1000) + 100; // Random amount between 100 and 1100

      await pool.query(
        'INSERT INTO bids (opdracht_id, user_id, amount, comment) VALUES ($1, $2, $3, $4)',
        [opdrachtId, userId, amount, `Test bid ${i + 1}`]
      );

      console.log(`Added bid: opdracht ${opdrachtId}, user ${userId}, amount ${amount}`);
    }

    console.log('Test bids added successfully.');
  } catch (err) {
    console.error('Error adding test bids:', err);
  } finally {
    pool.end();
  }
}

addTestBids();
