import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/menu');
    } catch (err) {
      setError((err as Error).message ?? 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100vh] flex items-center justify-center">
      <div className="site__container w-full max-w-md px-4">
        <h1
          className="text-center text-[#ea4c88] mb-8"
          style={{ fontFamily: 'EchoDeco', fontSize: '60px', fontWeight: 100 }}
        >
          Login
        </h1>

        <form onSubmit={handleSubmit} className="grid__container">
          <div className="form-field">
            <label className="form-label" style={{ fontFamily: 'Open Sans' }}>
              ✉
            </label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label className="form-label" style={{ fontFamily: 'Open Sans' }}>
              🔒
            </label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {error && (
            <p className="text-[#ea4c88] text-center mb-4 text-sm">{error}</p>
          )}

          <input
            type="submit"
            value={loading ? 'Logging in...' : 'LOG IN'}
            disabled={loading}
            className="btn-dde-pink w-full disabled:opacity-50"
          />
        </form>

        <p className="text-center mt-6 text-[#606468] text-sm">
          No account?{' '}
          <Link to="/signup" className="text-[#eee] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
