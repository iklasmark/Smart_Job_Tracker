const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DATABASE
});


pool.connect((err, client, release) => {
  if (err) {
    console.log('Connection failed');
    return;
  }

  console.log('Database connected');
  release(); // return connection to pool
});

// pool.query('SELECT 1')
//   .then(() => console.log('Database connected'))
//   .catch(err => console.log('Connection failed:', err.message));


module.exports = pool;