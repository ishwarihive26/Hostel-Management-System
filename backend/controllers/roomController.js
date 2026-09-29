const { Room, User } = require('../models');

const studentInclude = {
  model: User,
  as: 'students',
  attributes: ['_id', 'name', 'email', 'rollNumber'],
};

// @route  POST /api/rooms
// @desc   Admin adds a new hostel room
// @access Private/Admin
const addRoom = async (req, res) => {
  try {
    const { roomNumber, block, capacity } = req.body;

    if (!roomNumber || !block) {
      return res.status(400).json({ message: 'Room number and block are required' });
    }

    const cap = capacity ? Number(capacity) : 2;
    if (cap < 1 || cap > 2) {
      return res.status(400).json({ message: 'Room capacity must be 1 or 2 students' });
    }

    const existing = await Room.findOne({ where: { roomNumber: roomNumber.toUpperCase() } });
    if (existing) {
      return res.status(409).json({ message: 'A room with this number already exists' });
    }

    const room = await Room.create({
      roomNumber: roomNumber.toUpperCase(),
      block: block.toUpperCase(),
      capacity: cap,
    });

    return res.status(201).json({ room });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'A room with this number already exists' });
    }
    return res.status(500).json({ message: 'Server error while adding room', error: err.message });
  }
};

// @route  GET /api/rooms
// @desc   Get all rooms with allocated student details
// @access Private/Admin
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: studentInclude,
      order: [
        ['block', 'ASC'],
        ['roomNumber', 'ASC'],
      ],
    });
    return res.status(200).json({ rooms });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching rooms', error: err.message });
  }
};

// @route  GET /api/rooms/my-room
// @desc   Student views their assigned room details
// @access Private/Student
const getMyRoom = async (req, res) => {
  try {
    if (!req.user.assignedRoom) {
      return res.status(200).json({ room: null, message: 'No room has been allocated to you yet' });
    }

    const room = await Room.findByPk(req.user.assignedRoom, { include: studentInclude });

    return res.status(200).json({ room });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching room details', error: err.message });
  }
};

// @route  GET /api/rooms/unassigned-students
// @desc   Admin fetches students who are not currently allocated to any room
// @access Private/Admin
const getUnassignedStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student', assignedRoom: null },
      attributes: ['_id', 'name', 'email', 'rollNumber'],
    });
    return res.status(200).json({ students });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching students', error: err.message });
  }
};

// @route  POST /api/rooms/:roomId/allocate
// @desc   Admin allocates a student to a room
// @access Private/Admin
const allocateStudent = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Rule: max 2 students per room
    const occupied = await User.count({ where: { assignedRoom: room._id } });
    if (occupied >= room.capacity) {
      return res.status(400).json({ message: 'This room is already full (maximum capacity reached)' });
    }

    // Rule: a student cannot be assigned to more than one active room
    if (student.assignedRoom) {
      return res
        .status(400)
        .json({ message: `${student.name} is already assigned to another room. Please unassign first.` });
    }

    student.assignedRoom = room._id;
    await student.save();

    const updatedRoom = await Room.findByPk(room._id, { include: studentInclude });

    return res.status(200).json({ message: 'Student allocated successfully', room: updatedRoom });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while allocating student', error: err.message });
  }
};

// @route  POST /api/rooms/:roomId/unallocate
// @desc   Admin removes a student from a room
// @access Private/Admin
const unallocateStudent = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const student = await User.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.assignedRoom !== room._id) {
      return res.status(400).json({ message: 'This student is not allocated to this room' });
    }

    student.assignedRoom = null;
    await student.save();

    const updatedRoom = await Room.findByPk(room._id, { include: studentInclude });

    return res.status(200).json({ message: 'Student removed from room', room: updatedRoom });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while unallocating student', error: err.message });
  }
};

module.exports = {
  addRoom,
  getRooms,
  getMyRoom,
  getUnassignedStudents,
  allocateStudent,
  unallocateStudent,
};
