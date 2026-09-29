import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roomRes, complaintsRes] = await Promise.all([
          api.get('/rooms/my-room'),
          api.get('/complaints'),
        ]);
        setRoom(roomRes.data.room);
        setComplaints(complaintsRes.data.complaints);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <DashboardLayout role="student" title="">
      <div className="greeting-row">
        <div>
          <h2>Hello, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="muted">Welcome back to your hostel dashboard.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid">
        <div className="stat-card stat-purple">
          <span className="stat-label">Your Room</span>
          <span className="stat-value">{room ? room.roomNumber : 'Not Assigned'}</span>
          <span className="stat-sub">{room ? `Block ${room.block}` : 'Contact admin'}</span>
        </div>
        <div className="stat-card stat-blue">
          <span className="stat-label">Total Complaints</span>
          <span className="stat-value">{complaints.length}</span>
          <Link to="/student/complaints" className="stat-link">
            View Details →
          </Link>
        </div>
        <div className="stat-card stat-orange">
          <span className="stat-label">Pending Complaints</span>
          <span className="stat-value">{pendingCount}</span>
          <Link to="/student/complaints" className="stat-link">
            View Details →
          </Link>
        </div>
        <div className="stat-card stat-teal">
          <span className="stat-label">Resolved Complaints</span>
          <span className="stat-value">{resolvedCount}</span>
          <Link to="/student/complaints" className="stat-link">
            View Details →
          </Link>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h3>Recent Complaints</h3>
            <Link to="/student/complaints" className="link-small">
              View All
            </Link>
          </div>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : complaints.length === 0 ? (
            <p className="muted">You haven't raised any complaints yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {complaints.slice(0, 5).map((c) => (
                  <tr key={c._id}>
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

        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <Link to="/student/complaints" className="quick-action quick-red">
              📢 Raise Complaint
            </Link>
            <Link to="/student/my-room" className="quick-action quick-blue">
              🛏️ View Room Details
            </Link>
            <Link to="/student/dashboard" className="quick-action quick-green">
              👤 Update Profile
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
