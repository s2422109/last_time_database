import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // ★ このuseEffectが、ログイン済みのユーザーを自動でリダイレクトします
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // ログインボタンを押してこのページに来ても、トークンがあれば即座に地図へ
      navigate('/map');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ★★★ URLをPHPサーバーの正しいパスに変更 ★★★
      const response = await axios.post('http://localhost:8000/api/users/login.php', {
        email,
        password,
      });
      // ★★★ ここまでが修正点 ★★★

      // ログイン成功後はトークンを保存して地図ページへ
      localStorage.setItem('token', response.data.token);
      navigate('/map');
    } catch (error) {
      console.error('ログインに失敗しました', error);
      alert('メールアドレスまたはパスワードが違います。');
    }
  };

  // ★ トークンがある場合は何も表示しない（すぐにリダイレクトされるため）
  if (localStorage.getItem('token')) {
    return null;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>ログイン</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
}

export default LoginPage;