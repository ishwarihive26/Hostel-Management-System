const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Complaint = sequelize.define(
  'Complaint',
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.UUID, allowNull: false },
    roomId: { type: DataTypes.UUID, allowNull: false },
    category: {
      type: DataTypes.ENUM('Maintenance', 'Food', 'Housekeeping', 'Electrical', 'Plumbing', 'Other'),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Subject is required' } },
      set(v) {
        this.setDataValue('subject', typeof v === 'string' ? v.trim() : v);
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: 'Description is required' } },
      set(v) {
        this.setDataValue('description', typeof v === 'string' ? v.trim() : v);
      },
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Resolved'),
      allowNull: false,
      defaultValue: 'Pending',
    },
  },
  { tableName: 'complaints', timestamps: true }
);

module.exports = Complaint;
