import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/student/my-room', label: 'My Room', icon: '🛏️' },
  { to: '/student/complaints', label: 'Complaints', icon: '📢' },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/admin/rooms', label: 'Room Allocation', icon: '🗝️' },
  { to: '/admin/complaints', label: 'Complaints', icon: '📢' },
];

const Sidebar = ({ role }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const links = role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">🏠</span>
        <span>HostelHub</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button className="sidebar-logout" onClick={handleLogout}>
        <span className="sidebar-link-icon">🚪</span>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
