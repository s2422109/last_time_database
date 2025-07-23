import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>思い出マップへようこそ！</h1>
      <p>あなたが訪れた場所の思い出を、写真とタグで地図上に記録しましょう。</p>
      <p>さあ、冒険の地図を広げよう。</p>
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        {/* ★ ボタンを2つに固定 */}
        <Link to="/register" style={{ padding: '0.8rem 1.5rem', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          新規登録
        </Link>
        <Link to="/login" style={{ padding: '0.8rem 1.5rem', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          ログイン
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
