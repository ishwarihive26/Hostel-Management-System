const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');
const sqlite3 = require('sqlite3');

const dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase();

let sequelize;

if (dialect === 'postgres' || dialect === 'postgresql') {
  const pg = require('pg');

  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
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
  const storage = process.env.SQLITE_PATH || '/tmp/hostelhub.sqlite';
  fs.mkdirSync('/tmp', { recursive: true });

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false,
    dialectModule: sqlite3,
  });
}

// Creates the MySQL database if it does not exist yet.
const ensureMysqlDatabase = async () => {
  const mysql = require('mysql2/promise');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'hostelhub'}\``
  );

  await conn.end();
};

// connectDB({ force: true }) drops and recreates all tables (used by seed.js)
const connectDB = async ({ force = false } = {}) => {
  try {
    if (dialect === 'mysql') {
      await ensureMysqlDatabase();
    }

    require('../models');

    await sequelize.authenticate();
    await sequelize.sync({ force });

    console.log(`SQL database connected (${dialect})`);
  } catch (err) {
    console.error(`Database connection error: ${err.message}`);
    process.exit(1);
  }
};

connectDB.sequelize = sequelize;

module.exports = connectDB;
