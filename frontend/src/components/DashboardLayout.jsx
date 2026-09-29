import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = ({ role, title, children }) => {
  return (
    <div className="dashboard-shell">
      <Sidebar role={role} />
      <div className="dashboard-main">
        <Topbar title={title} />
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
