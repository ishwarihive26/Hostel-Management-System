import { useAuth } from '../context/AuthContext';

const Topbar = ({ title }) => {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-user">
        <div className="avatar">{initials}</div>
        <div className="topbar-user-info">
          <span className="topbar-user-name">{user?.name}</span>
          <span className="topbar-user-role">{user?.role === 'admin' ? 'Administrator' : 'Student'}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
