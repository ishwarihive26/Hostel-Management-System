const express = require('express');
const router = express.Router();
const {
  addRoom,
  getRooms,
  getMyRoom,
  getUnassignedStudents,
  allocateStudent,
  unallocateStudent,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

// Student route (must be defined before parametric admin routes are irrelevant, but kept clear)
router.get('/my-room', protect, authorize('student'), getMyRoom);

// Admin routes
router.get('/unassigned-students', protect, authorize('admin'), getUnassignedStudents);
router.post('/', protect, authorize('admin'), addRoom);
router.get('/', protect, authorize('admin'), getRooms);
router.post('/:roomId/allocate', protect, authorize('admin'), allocateStudent);
router.post('/:roomId/unallocate', protect, authorize('admin'), unallocateStudent);

module.exports = router;
