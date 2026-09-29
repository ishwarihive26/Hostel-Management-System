const StatusBadge = ({ status }) => {
  const className = status === 'Resolved' ? 'badge badge-resolved' : 'badge badge-pending';
  return <span className={className}>{status}</span>;
};

export default StatusBadge;
