import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UploadPage() {
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const navigate = useNavigate();

  // ★ 位置情報を管理するためのStateを追加
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // ★ 現在地を取得する関数
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('お使いのブラウザは位置情報取得に対応していません。');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    // Geolocation APIを呼び出し
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 成功時の処理
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        // 失敗時の処理
        setLocationError(`位置情報の取得に失敗しました: ${error.message}`);
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    // ★ 位置情報が取得されているかチェック
    if (!location) {
      alert('位置情報を取得してください。');
      return;
    }
    if (!token) {
      alert('ログインしてください。');
      return;
    }

    const formData = new FormData();
    if (image) {
      formData.append('image', image);
    }
    formData.append('comment', comment);
    // ★ 取得した位置情報をセット
    formData.append('latitude', String(location.lat));
    formData.append('longitude', String(location.lon));
    formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim())));

    try {
      await axios.post('http://localhost:3001/api/memories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      navigate('/');
    } catch (error) {
      console.error('投稿に失敗しました', error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>思い出を記録する</h2>
      <form onSubmit={handleSubmit}>
        {/* ★ 位置情報取得セクション */}
        <div>
          <button type="button" onClick={handleGetLocation} disabled={isGettingLocation}>
            {isGettingLocation ? '位置情報を取得中...' : '現在地を取得する'}
          </button>
          {location && (
            <p style={{ color: 'green' }}>
              位置情報を取得しました！ (緯度: {location.lat.toFixed(4)}, 経度: {location.lon.toFixed(4)})
            </p>
          )}
          {locationError && <p style={{ color: 'red' }}>{locationError}</p>}
        </div>

        <hr style={{ margin: '1rem 0' }} />

        <div>
          <label>写真:</label>
          <input type="file" onChange={(e) => e.target.files && setImage(e.target.files[0])} required />
        </div>
        <div>
          <label>コメント:</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} required />
        </div>
        <div>
          <label>タグ (カンマ区切り):</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <button type="submit" disabled={!location}>投稿</button>
      </form>
    </div>
  );
}

export default UploadPage;
