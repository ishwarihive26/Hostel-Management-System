const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define(
  'User',
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Name is required' } },
      set(v) {
        this.setDataValue('name', typeof v === 'string' ? v.trim() : v);
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { is: { args: /^\S+@\S+\.\S+$/, msg: 'Please provide a valid email' } },
      set(v) {
        this.setDataValue('email', typeof v === 'string' ? v.trim().toLowerCase() : v);
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: { args: [6, 255], msg: 'Password must be at least 6 characters' } },
    },
    role: {
      type: DataTypes.ENUM('student', 'admin'),
      allowNull: false,
    },
    // Student-only fields (NULL for admins; SQL UNIQUE allows multiple NULLs)
    rollNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      set(v) {
        const val = typeof v === 'string' ? v.trim().toUpperCase() : v;
        this.setDataValue('rollNumber', val || null);
      },
    },
    assignedRoom: { type: DataTypes.UUID, allowNull: true, defaultValue: null },
  },
  {
    tableName: 'users',
    timestamps: true,
    defaultScope: { attributes: { exclude: ['password'] } },
    scopes: { withPassword: {} },
  }
);

// Hash password before saving (only when it changed)
User.beforeSave(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.prototype.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    rollNumber: this.rollNumber || null,
    assignedRoom: this.assignedRoom || null,
  };
};

module.exports = User;
