// test-db.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection successful!');
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await sequelize.close();
  }
})();
