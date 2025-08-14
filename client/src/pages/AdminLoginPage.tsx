import { useState } from 'react';
import { apiRequest } from '../lib/queryClient';
import { useLocation } from 'wouter';
const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [, navigate] = useLocation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default form submission
    apiRequest('POST', '/api/admin/login', { email, password })
      .then(res => {
        if (res.ok) console.log('Login successful'); // Log success if response is ok
        else console.error('Login failed', res.status); // Log failure with status
        if (res.ok) {
          navigate('/admin');
        }
      })
      .catch(error => console.error('Login request failed:', error)); // Log any errors
  };

  return (
    <div>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLoginPage;
