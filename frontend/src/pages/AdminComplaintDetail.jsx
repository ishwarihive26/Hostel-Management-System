import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

const AdminComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadComplaint = async () => {
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setComplaint(data.complaint);
      setStatus(data.complaint.status);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async () => {
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.patch(`/complaints/${id}`, { status });
      setComplaint(data.complaint);
      setSuccess('Complaint status updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin" title="Complaint Details">
        <p className="muted">Loading...</p>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout role="admin" title="Complaint Details">
        <div className="alert alert-error">{error || 'Complaint not found'}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" title="Complaint Details">
      <Link to="/admin/complaints" className="link-small back-link">
        ← Back
      </Link>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h3>#{complaint._id.slice(-6).toUpperCase()}</h3>
            <StatusBadge status={complaint.status} />
          </div>
          <div className="detail-rows">
            <div className="detail-row">
              <span className="detail-label">Category</span>
              <span>{complaint.category}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Subject</span>
              <span>{complaint.subject}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Description</span>
              <span>{complaint.description}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Raised By</span>
              <span>
                {complaint.student?.name} (Roll No: {complaint.student?.rollNumber})
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Room</span>
              <span>
                {complaint.room?.roomNumber} (Block {complaint.room?.block})
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date</span>
              <span>{new Date(complaint.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Update Status</h3>
          </div>
          <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>
          <button className="btn btn-primary btn-block mt-3" onClick={handleUpdate} disabled={updating}>
            {updating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminComplaintDetail;
