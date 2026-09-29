import { Link } from 'react-router-dom';
import heroImage from '../assets/hostel-building.jpg';

const features = [
  {
    icon: '🪪',
    title: 'Easy Room Allocation',
    desc: 'View and manage room assignments',
  },
  {
    icon: '📍',
    title: 'Complaint Management',
    desc: 'Raise and track complaints in real-time',
  },
  {
    icon: '🔒',
    title: 'Secure Authentication',
    desc: 'Safe and easy login for students & admins',
  },
  {
    icon: '💬',
    title: '24/7 Support',
    desc: 'We are always here to help you',
  },
];

const Home = () => {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-brand">
          <span className="brand-icon">🏠</span>
          HostelHub
        </div>
        <div className="landing-nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </div>
        <Link to="/login" className="btn btn-primary btn-sm">
          Login / Register
        </Link>
      </nav>

      <section className="hero" id="home" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero-overlay" />
        <div className="hero-text">
          <p className="hero-kicker">Welcome to</p>
          <h1>
            Hostel<span className="text-gradient">Hub</span>
          </h1>
          <h2 className="hero-subtitle">Your Hostel, Our Priority</h2>
          <p className="hero-desc">
            Easily manage room allocation, track your stay, raise complaints
            and get quick support — all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary">
              Login <span aria-hidden="true">→</span>
            </Link>
            <Link to="/register" className="btn btn-outline">
              Register
            </Link>
          </div>
        </div>

        <div className="feature-strip">
          {features.map((f) => (
            <div className="feature-pill" key={f.title}>
              <div className="feature-pill-icon">{f.icon}</div>
              <div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about" id="about">
        <h2>About HostelHub</h2>
        <p>
          HostelHub is a simple hostel room management system that helps wardens
          allocate rooms efficiently and gives students a transparent way to view
          their room and raise complaints.
        </p>
      </section>

      <section className="features-detail" id="features">
        {features.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <footer className="landing-footer" id="contact">
        <p>&copy; {new Date().getFullYear()} HostelHub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
