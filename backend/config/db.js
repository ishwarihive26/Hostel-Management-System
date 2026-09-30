const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');

const dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase();

let sequelize;
if (dialect === 'postgres') {
  // Explicit require so Vercel bundles the pg driver into the serverless function
  const pg = require('pg');
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  sequelize = new Sequelize(url, {
    dialect: 'postgres',
    dialectModule: pg,
    logging: false,
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  });
} else if (dialect === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'hostelhub',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: false,
    }
  );
} else {
  const storage = path.resolve(__dirname, '..', process.env.SQLITE_PATH || 'database/hostelhub.sqlite');
  fs.mkdirSync(path.dirname(storage), { recursive: true });
  sequelize = new Sequelize({ dialect: 'sqlite', storage, logging: false });
}

// Creates the MySQL database if it does not exist yet (SQLite/Postgres need nothing).
const ensureMysqlDatabase = async () => {
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'hostelhub'}\``);
  await conn.end();
};

// connectDB({ force: true }) drops and recreates all tables (used by seed.js)
const connectDB = async ({ force = false } = {}) => {
  try {
    if (dialect === 'mysql') await ensureMysqlDatabase();
    require('../models'); // registers models + associations
    await sequelize.authenticate();
    await sequelize.sync({ force });
    console.log(`SQL database connected (${dialect})`);
  } catch (err) {
    console.error(`Database connection error: ${err.message}`);
    // On Vercel, exiting kills the function; throw so the request returns the real error instead.
    if (process.env.VERCEL) throw err;
    process.exit(1);
  }
};

connectDB.sequelize = sequelize;
module.exports = connectDB;
