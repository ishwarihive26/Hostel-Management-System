import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';

const RoomAllocation = () => {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [blockFilter, setBlockFilter] = useState('All');

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ roomNumber: '', block: '', capacity: 2 });

  const [allocatingRoomId, setAllocatingRoomId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');

  const loadData = async () => {
    try {
      const [roomsRes, studentsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/rooms/unassigned-students'),
      ]);
      setRooms(roomsRes.data.rooms);
      setStudents(studentsRes.data.students);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load room data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const blocks = useMemo(() => {
    const unique = Array.from(new Set(rooms.map((r) => r.block)));
    return ['All', ...unique];
  }, [rooms]);

  const filteredRooms = rooms.filter((r) => {
    const matchesBlock = blockFilter === 'All' || r.block === blockFilter;
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.block.toLowerCase().includes(search.toLowerCase());
    return matchesBlock && matchesSearch;
  });

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/rooms', newRoom);
      setSuccess(`Room ${newRoom.roomNumber.toUpperCase()} added successfully`);
      setNewRoom({ roomNumber: '', block: '', capacity: 2 });
      setShowAddRoom(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add room');
    }
  };

  const openAllocate = (roomId) => {
    setAllocatingRoomId(roomId);
    setSelectedStudent('');
    setError('');
    setSuccess('');
  };

  const handleAllocate = async (roomId) => {
    if (!selectedStudent) {
      setError('Please select a student to allocate');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post(`/rooms/${roomId}/allocate`, { studentId: selectedStudent });
      setSuccess(data.message);
      setAllocatingRoomId(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to allocate student');
    }
  };

  const handleUnallocate = async (roomId, studentId) => {
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post(`/rooms/${roomId}/unallocate`, { studentId });
      setSuccess(data.message);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove student');
    }
  };

  return (
    <DashboardLayout role="admin" title="Room Allocation">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Rooms</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddRoom((s) => !s)}>
            {showAddRoom ? 'Cancel' : '+ Add Room'}
          </button>
        </div>

        {showAddRoom && (
          <form className="inline-form" onSubmit={handleAddRoom}>
            <input
              type="text"
              placeholder="Room No. (e.g. A-101)"
              className="form-input"
              value={newRoom.roomNumber}
              onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Block (e.g. A)"
              className="form-input"
              value={newRoom.block}
              onChange={(e) => setNewRoom({ ...newRoom, block: e.target.value })}
              required
            />
            <select
              className="form-input"
              value={newRoom.capacity}
              onChange={(e) => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })}
            >
              <option value={1}>Capacity: 1</option>
              <option value={2}>Capacity: 2</option>
            </select>
            <button className="btn btn-primary" type="submit">
              Save Room
            </button>
          </form>
        )}

        <div className="filter-bar">
          <div className="input-group input-group-search">
            <span className="input-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by room no. or block"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="form-input filter-select" value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)}>
            {blocks.map((b) => (
              <option key={b} value={b}>
                {b === 'All' ? 'All Blocks' : `Block ${b}`}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : filteredRooms.length === 0 ? (
          <p className="muted">No rooms found. Add a room to get started.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Room No.</th>
                <th>Block</th>
                <th>Capacity</th>
                <th>Allocated</th>
                <th>Available</th>
                <th>Students</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => {
                const isFull = room.students.length >= room.capacity;
                return (
                  <tr key={room._id}>
                    <td>{room.roomNumber}</td>
                    <td>{room.block}</td>
                    <td>{room.capacity}</td>
                    <td>{room.students.length}</td>
                    <td>{room.capacity - room.students.length}</td>
                    <td>
                      {room.students.length === 0 ? (
                        <span className="muted small">—</span>
                      ) : (
                        <div className="chip-list">
                          {room.students.map((s) => (
                            <span className="chip" key={s._id}>
                              {s.name}
                              <button
                                type="button"
                                className="chip-remove"
                                title="Remove from room"
                                onClick={() => handleUnallocate(room._id, s._id)}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      {isFull ? (
                        <span className="badge badge-full">Full</span>
                      ) : allocatingRoomId === room._id ? (
                        <div className="allocate-box">
                          <select
                            className="form-input form-input-sm"
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                          >
                            <option value="">Select student</option>
                            {students.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name} ({s.rollNumber})
                              </option>
                            ))}
                          </select>
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={() => handleAllocate(room._id)}
                            type="button"
                          >
                            Confirm
                          </button>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => setAllocatingRoomId(null)}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary btn-xs"
                          onClick={() => openAllocate(room._id)}
                          type="button"
                        >
                          Allocate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RoomAllocation;
