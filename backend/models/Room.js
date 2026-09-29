const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Room = sequelize.define(
  'Room',
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: 'Room number is required' } },
      set(v) {
        this.setDataValue('roomNumber', typeof v === 'string' ? v.trim().toUpperCase() : v);
      },
    },
    block: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Block is required' } },
      set(v) {
        this.setDataValue('block', typeof v === 'string' ? v.trim().toUpperCase() : v);
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
      validate: {
        min: { args: [1], msg: 'Capacity must be at least 1' },
        max: { args: [2], msg: 'Capacity cannot exceed 2 students per room' },
      },
    },
    // Only meaningful when "students" are included in the query
    availableSlots: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.capacity - (this.students ? this.students.length : 0);
      },
    },
  },
  { tableName: 'rooms', timestamps: true }
);

module.exports = Room;
