import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const MyRoom = () => {
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const { data } = await api.get('/rooms/my-room');
        setRoom(data.room);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };
    loadRoom();
  }, []);

  return (
    <DashboardLayout role="student" title="My Room">
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="muted">Loading...</p>
      ) : !room ? (
        <div className="card empty-state">
          <div className="empty-icon">🛏️</div>
          <h3>No Room Assigned</h3>
          <p className="muted">
            You haven't been allocated a room yet. Please contact the hostel admin/warden.
          </p>
        </div>
      ) : (
        <div className="card room-detail-card">
          <div className="room-detail-header">
            <div>
              <h2>{room.roomNumber}</h2>
              <p className="muted">Block {room.block}</p>
            </div>
            <span className="badge badge-info">
              {room.students.length} / {room.capacity} Occupied
            </span>
          </div>

          <div className="room-detail-grid">
            <div>
              <span className="detail-label">Capacity</span>
              <span className="detail-value">{room.capacity} students</span>
            </div>
            <div>
              <span className="detail-label">Available Slots</span>
              <span className="detail-value">{room.capacity - room.students.length}</span>
            </div>
          </div>

          <h4 className="section-subtitle">Roommates</h4>
          <div className="roommate-list">
            {room.students.map((s) => (
              <div className="roommate-item" key={s._id}>
                <div className="avatar avatar-sm">{s.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <p className="roommate-name">
                    {s.name} {s._id === user?.id && <span className="tag-you">You</span>}
                  </p>
                  <p className="muted small">Roll No: {s.rollNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyRoom;
