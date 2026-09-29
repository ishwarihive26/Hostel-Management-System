const { Complaint, User, Room } = require('../models');

const withRelations = [
  { model: User, as: 'student', attributes: ['_id', 'name', 'email', 'rollNumber'] },
  { model: Room, as: 'room', attributes: ['_id', 'roomNumber', 'block'] },
];

const ALLOWED_CATEGORIES = ['Maintenance', 'Food', 'Housekeeping', 'Electrical', 'Plumbing', 'Other'];

// @route  POST /api/complaints
// @desc   Student submits a complaint (only if assigned to a room)
// @access Private/Student
const createComplaint = async (req, res) => {
  try {
    const { category, subject, description } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({ message: 'Category, subject and description are required' });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category selected' });
    }

    // Rule: only an assigned student can submit a complaint
    if (!req.user.assignedRoom) {
      return res
        .status(403)
        .json({ message: 'You must be allocated to a room before you can raise a complaint' });
    }

    const complaint = await Complaint.create({
      studentId: req.user._id,
      roomId: req.user.assignedRoom,
      category,
      subject,
      description,
    });

    return res.status(201).json({ complaint });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while creating complaint', error: err.message });
  }
};

// @route  GET /api/complaints
// @desc   Admin: view all complaints. Student: view own complaints.
// @access Private
const getComplaints = async (req, res) => {
  try {
    const where = req.user.role === 'student' ? { studentId: req.user._id } : {};

    const complaints = await Complaint.findAll({
      where,
      include: withRelations,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ complaints });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching complaints', error: err.message });
  }
};

// @route  GET /api/complaints/:id
// @desc   Get single complaint details
// @access Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id, { include: withRelations });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Students may only view their own complaint
    if (req.user.role === 'student' && complaint.studentId !== req.user._id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.status(200).json({ complaint });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while fetching complaint', error: err.message });
  }
};

// @route  PATCH /api/complaints/:id
// @desc   Admin marks a complaint as Resolved (or Pending)
// @access Private/Admin
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either "Pending" or "Resolved"' });
    }

    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    await complaint.save();

    const updated = await Complaint.findByPk(complaint._id, { include: withRelations });

    return res.status(200).json({ message: 'Complaint status updated', complaint: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while updating complaint', error: err.message });
  }
};

module.exports = { createComplaint, getComplaints, getComplaintById, updateComplaintStatus };
