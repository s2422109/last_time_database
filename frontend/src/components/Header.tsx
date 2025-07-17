import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header style={{ padding: '1rem', background: '#eee', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Link to="/" style={{ marginRight: 'auto', fontWeight: 'bold' }}>思い出マップ</Link>
      
      {token ? (
        <>
          <Link to="/map">マップ</Link>
          <Link to="/upload">投稿する</Link>
          <button onClick={handleLogout}>ログアウト</button>
        </>
      ) : (
        <>
          {/* ★ 未ログイン時の表示を変更 */}
          <Link to="/login">ログイン</Link>
          <Link to="/register">新規登録</Link>
        </>
      )}
    </header>
  );
}

export default Header;
