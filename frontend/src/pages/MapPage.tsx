import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// --- アイコン設定 ---
import L from 'leaflet';
// ローカルのassetsフォルダからカスタム画像をインポート
import customPinUrl from '../assets/kkrn_icon_pin_4.png'; 

// インポートした画像URLを使って、新しいカスタムアイコンを定義
const customIcon = new L.Icon({
  iconUrl: customPinUrl,
  iconSize: [35, 41],   // アイコンのサイズ [幅, 高さ]
  iconAnchor: [12, 41],  // アイコンの「先端」が来る位置
  popupAnchor: [1, -34], // ポップアップが開く位置
});
// --- ここまでがアイコン設定 ---


interface Memory {
  imageUrl: string | undefined;
  id: number;
  comment: string;
  latitude: number;
  longitude: number;
  author: { name: string | null };
  tags: { tag: { name: string } }[];
}

function MapPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');

  useEffect(() => {
    const fetchMemories = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const tags = activeSearchTerm.trim().split(/\s+/);
        const cleanedTags = tags
          .map(tag => tag.startsWith('#') ? tag.substring(1) : tag)
          .filter(tag => tag.length > 0);
        const formattedSearchTerm = cleanedTags.join(',');

        const url = formattedSearchTerm
          ? `http://localhost:3001/api/memories?tags=${encodeURIComponent(formattedSearchTerm)}`
          : 'http://localhost:3001/api/memories';
        
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setMemories(response.data);
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [activeSearchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearchTerm(inputValue);
  };

  if (loading) {
    return <div>地図を読み込んでいます...</div>;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem', background: '#f0f0f0', borderBottom: '1px solid #ddd' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="タグをスペース区切りで検索..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ flexGrow: 1, padding: '0.5rem' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem' }}>検索</button>
        </form>
      </div>
      
      <div style={{ flexGrow: 1 }}>
        <MapContainer
          center={[35.681236, 139.767125]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {memories.map((memory) => (
            // ★ 全てのマーカーに、作成したカスタムアイコンを適用します
            <Marker key={memory.id} position={[memory.latitude, memory.longitude]} icon={customIcon}>
              <Popup>
                {/* ★★★ ここからが修正点 ★★★ */}
                <div>
                  {/* 投稿された画像を表示するimgタグを追加 */}
                  <img 
                    src={memory.imageUrl} 
                    alt={memory.comment} 
                    style={{ width: '100%', height: 'auto', borderRadius: '4px', marginBottom: '8px' }} 
                  />
                  
                  <p><strong>コメント:</strong> {memory.comment}</p>
                  <p><strong>投稿者:</strong> {memory.author.name || '名無し'}</p>
                  <div>
                    <strong>タグ:</strong>
                    {memory.tags.map(t => `#${t.tag.name}`).join(' ')}
                  </div>
                </div>
                {/* ★★★ ここまでが修正点 ★★★ */}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapPage;
