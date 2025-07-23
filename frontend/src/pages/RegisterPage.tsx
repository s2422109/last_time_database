import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. 新規登録APIを呼び出し
      await axios.post('http://localhost:3001/api/users/register', {
        name,
        email,
        password,
      });

      // 2. 登録成功後、そのままログインAPIを呼び出し
      const loginResponse = await axios.post('http://localhost:3001/api/users/login', {
        email,
        password,
      });

      // 3. 取得したトークンを保存
      localStorage.setItem('token', loginResponse.data.token);
      
      // 4. 地図ページへ移動
      navigate('/map');
    } catch (error) {
      console.error('新規登録に失敗しました', error);
      alert('このメールアドレスは既に使用されているか、入力に誤りがあります。');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>新規登録</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>ユーザー名:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>メールアドレス:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>パスワード:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">登録して始める</button>
      </form>
    </div>
  );
}

export default RegisterPage;