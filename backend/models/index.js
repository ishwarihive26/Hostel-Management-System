const User = require('./User');
const Room = require('./Room');
const Complaint = require('./Complaint');

// Room has many students (users.assignedRoom -> rooms._id)
Room.hasMany(User, { foreignKey: 'assignedRoom', as: 'students', onDelete: 'SET NULL' });
User.belongsTo(Room, { foreignKey: 'assignedRoom', as: 'room' });

// Complaint belongs to a student and a room
Complaint.belongsTo(User, { foreignKey: 'studentId', as: 'student', onDelete: 'CASCADE' });
Complaint.belongsTo(Room, { foreignKey: 'roomId', as: 'room', onDelete: 'CASCADE' });
User.hasMany(Complaint, { foreignKey: 'studentId', as: 'complaints' });
Room.hasMany(Complaint, { foreignKey: 'roomId', as: 'complaints' });

module.exports = { User, Room, Complaint };
