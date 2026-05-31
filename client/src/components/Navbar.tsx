import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav
      style={{
        display: 'block',
        background: 'black',
        borderBottom: '1px solid white',
        padding: '0 20px',
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ maxWidth: '1340px', width: '91%', margin: '0 auto', paddingTop: '20px', paddingBottom: '12px' }}
      >
        <Link
          to="/"
          style={{ color: 'white', fontSize: '16px', fontFamily: 'Open Sans' }}
        >
          Dance Dance Evolution
        </Link>

        <div className="flex items-center gap-6" style={{ fontSize: '16px', fontFamily: 'Open Sans' }}>
          {user ? (
            <>
              <span style={{ color: 'white' }}>Welcome, {user.username}</span>
              <Link to="/highscores" style={{ color: 'white' }}>
                High Scores
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  float: 'right',
                  border: '1px solid white',
                  background: 'none',
                  color: 'white',
                  padding: '4px 12px',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white' }}>Login</Link>
              <Link to="/signup" style={{ color: '#2DDEFF' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
