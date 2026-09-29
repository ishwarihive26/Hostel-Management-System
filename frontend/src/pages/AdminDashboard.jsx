import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roomsRes, complaintsRes] = await Promise.all([
          api.get('/rooms'),
          api.get('/complaints'),
        ]);
        setRooms(roomsRes.data.rooms);
        setComplaints(complaintsRes.data.complaints);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalStudentsAllocated = rooms.reduce((sum, r) => sum + r.students.length, 0);
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);

  return (
    <DashboardLayout role="admin" title="">
      <div className="greeting-row">
        <div>
          <h2>Welcome, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="muted">Here's what's happening in your hostel today.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid">
        <div className="stat-card stat-purple">
          <span className="stat-label">Total Rooms</span>
          <span className="stat-value">{rooms.length}</span>
          <span className="stat-sub">{totalCapacity} total capacity</span>
        </div>
        <div className="stat-card stat-blue">
          <span className="stat-label">Students Allocated</span>
          <span className="stat-value">{totalStudentsAllocated}</span>
          <Link to="/admin/rooms" className="stat-link">
            Manage Rooms →
          </Link>
        </div>
        <div className="stat-card stat-orange">
          <span className="stat-label">Pending Complaints</span>
          <span className="stat-value">{pendingCount}</span>
          <Link to="/admin/complaints" className="stat-link">
            View Details →
          </Link>
        </div>
        <div className="stat-card stat-teal">
          <span className="stat-label">Total Complaints</span>
          <span className="stat-value">{complaints.length}</span>
          <Link to="/admin/complaints" className="stat-link">
            View Details →
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Complaints</h3>
          <Link to="/admin/complaints" className="link-small">
            View All
          </Link>
        </div>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : complaints.length === 0 ? (
          <p className="muted">No complaints have been raised yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Room</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {complaints.slice(0, 6).map((c) => (
                <tr key={c._id}>
                  <td>{c.student?.name}</td>
                  <td>{c.room?.roomNumber}</td>
                  <td>{c.subject}</td>
                  <td>{c.category}</td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
