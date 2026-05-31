import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(email, username, password);
      navigate('/menu');
    } catch (err) {
      setError((err as Error).message ?? 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-56px)] flex items-center justify-center">
      <div className="site__container w-full max-w-md px-4">
        <h1
          className="text-center text-[#ea4c88] mb-8"
          style={{ fontFamily: 'EchoDeco', fontSize: '60px', fontWeight: 100 }}
        >
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} className="grid__container">
          {[
            { label: '✉', type: 'email', placeholder: 'Email', value: email, set: setEmail },
            { label: '👤', type: 'text', placeholder: 'Username', value: username, set: setUsername },
            { label: '🔒', type: 'password', placeholder: 'Password', value: password, set: setPassword },
          ].map(({ label, type, placeholder, value, set }) => (
            <div className="form-field" key={type}>
              <label className="form-label">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => set(e.target.value)}
                required
                className="form-input"
              />
            </div>
          ))}

          {error && (
            <p className="text-[#ea4c88] text-center mb-4 text-sm">{error}</p>
          )}

          <input
            type="submit"
            value={loading ? 'Creating account...' : 'SIGN UP'}
            disabled={loading}
            className="btn-dde-pink w-full disabled:opacity-50"
          />
        </form>

        <p className="text-center mt-6 text-[#606468] text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-[#eee] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
