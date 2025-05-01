import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');
  // const navigate = useNavigate();

  // const handleLogin = async () => {
  //   try {
  //     const res = await axios.post('http://192.168.1.196:8080/api/admin/login', { username, password });
  //     if (res.data.success) {
  //       navigate('/admin/dashboard');
  //     } else {
  //       alert('Invalid credentials');
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert('Error connecting to server');
  //   }
  // };

  // return (
  //   <div style={{ padding: '20px' }}>
  //     <h2>Admin Login</h2>
  //     <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
  //     <br />
  //     <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
  //     <br />
  //     <button onClick={handleLogin} style={{ marginTop: '10px' }}>Login</button>
  //   </div>
  // );
}
