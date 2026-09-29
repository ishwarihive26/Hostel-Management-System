// Seeds the database with test credentials and sample rooms.
// Run with: npm run seed
require('dotenv').config();
const connectDB = require('./config/db');
const { sequelize } = connectDB;
const { User, Room, Complaint } = require('./models');

const seed = async () => {
  console.log('Resetting tables...');
  await connectDB({ force: true }); // drops & recreates all tables

  console.log('Creating admin user...');
  await User.create({
    name: 'Admin Warden',
    email: 'admin@hostelhub.com',
    password: 'admin123',
    role: 'admin',
  });

  console.log('Creating student users...');
  const priya = await User.create({
    name: 'Priya Sharma',
    email: 'priya@hostelhub.com',
    password: 'student123',
    role: 'student',
    rollNumber: '22CS001',
  });

  const rahul = await User.create({
    name: 'Rahul Verma',
    email: 'rahul@hostelhub.com',
    password: 'student123',
    role: 'student',
    rollNumber: '22CS002',
  });

  await User.create({
    name: 'Ananya Iyer',
    email: 'ananya@hostelhub.com',
    password: 'student123',
    role: 'student',
    rollNumber: '22CS003',
  });

  console.log('Creating rooms...');
  const roomA101 = await Room.create({ roomNumber: 'A-101', block: 'A', capacity: 2 });
  await Room.create({ roomNumber: 'A-102', block: 'A', capacity: 2 });
  await Room.create({ roomNumber: 'B-201', block: 'B', capacity: 2 });
  const roomB203 = await Room.create({ roomNumber: 'B-203', block: 'B', capacity: 2 });
  await Room.create({ roomNumber: 'C-301', block: 'C', capacity: 2 });

  console.log('Allocating sample students...');
  priya.assignedRoom = roomB203._id;
  await priya.save();
  rahul.assignedRoom = roomA101._id;
  await rahul.save();

  console.log('Creating a sample complaint...');
  await Complaint.create({
    studentId: priya._id,
    roomId: roomB203._id,
    category: 'Maintenance',
    subject: 'Water leakage in washroom',
    description: 'There is water leakage in the washroom of Block B, 2nd floor. Please send someone to check.',
    status: 'Pending',
  });

  console.log('\nSeed complete! Test credentials:');
  console.log('-----------------------------------');
  console.log('Admin  -> email: admin@hostelhub.com  | password: admin123');
  console.log('Student-> email: priya@hostelhub.com   | password: student123 (assigned to B-203)');
  console.log('Student-> email: rahul@hostelhub.com   | password: student123 (assigned to A-101)');
  console.log('Student-> email: ananya@hostelhub.com  | password: student123 (unassigned)');
  console.log('-----------------------------------\n');

  await sequelize.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
