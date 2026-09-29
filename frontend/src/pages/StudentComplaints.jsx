import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

const CATEGORIES = ['Maintenance', 'Food', 'Housekeeping', 'Electrical', 'Plumbing', 'Other'];

const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [hasRoom, setHasRoom] = useState(true);
  const [form, setForm] = useState({ category: '', subject: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadComplaints = async () => {
    try {
      const [complaintsRes, roomRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/rooms/my-room'),
      ]);
      setComplaints(complaintsRes.data.complaints);
      setHasRoom(!!roomRes.data.room);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.category || !form.subject || !form.description) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/complaints', form);
      setSuccess('Complaint submitted successfully');
      setForm({ category: '', subject: '', description: '' });
      loadComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="student" title="Complaints">
      <div className="two-col two-col-wide">
        <div className="card">
          <div className="card-header">
            <h3>Raise a Complaint</h3>
          </div>

          {!hasRoom && (
            <div className="alert alert-warning">
              You must be allocated to a room before you can raise a complaint.
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="form">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-input"
              value={form.category}
              onChange={handleChange}
              disabled={!hasRoom}
              required
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label className="form-label">Subject</label>
            <input
              type="text"
              name="subject"
              className="form-input"
              placeholder="Enter subject"
              value={form.subject}
              onChange={handleChange}
              disabled={!hasRoom}
              required
            />

            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-input form-textarea"
              placeholder="Describe your issue in detail..."
              value={form.description}
              onChange={handleChange}
              disabled={!hasRoom}
              rows={5}
              required
            />

            <button className="btn btn-primary btn-block" type="submit" disabled={!hasRoom || submitting}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>My Complaints</h3>
          </div>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : complaints.length === 0 ? (
            <p className="muted">No complaints raised yet.</p>
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
                {complaints.map((c) => (
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
      </div>
    </DashboardLayout>
  );
};

export default StudentComplaints;
