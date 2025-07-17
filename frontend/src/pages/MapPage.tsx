import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// アイコン関連のimportと設定は変更なし
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


// Memoryの型定義は変更なし
interface Memory {
  id: number;
  comment: string;
  latitude: number;
  longitude: number;
  author: {
    name: string | null;
  };
  tags: {
    tag: {
      name: string;
    };
  }[];
}
function MapPage() {
  console.log("【1】MapPageコンポーネントがレンダリングされました。");

  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');

  useEffect(() => {
    console.log("【2】useEffectが実行されました。検索キーワード:", activeSearchTerm);

    const fetchMemories = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("【3-A】トークンが見つからないため、処理を中断します。");
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
        
        console.log("【3-B】APIリクエストを送信します。URL:", url);
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("【4】APIからデータを受信しました。データ:", response.data);
        setMemories(response.data);

      } catch (error) {
        console.error("【5】データの取得中にエラーが発生しました:", error);
      } finally {
        console.log("【6】データ取得処理が完了しました。");
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
    console.log("【7】ローディング画面を表示します。");
    return <div>地図を読み込んでいます...</div>;
  }

  console.log("【8】地図とマーカーの描画を開始します。思い出の件数:", memories.length);

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
          {memories.map((memory) => {
            console.log(`【9】マーカーを描画します: ${memory.comment}`);
            return (
              <Marker key={memory.id} position={[memory.latitude, memory.longitude]}>
                <Popup>
                  <div>
                    <p><strong>コメント:</strong> {memory.comment}</p>
                    <p><strong>投稿者:</strong> {memory.author.name || '名無し'}</p>
                    <div>
                      <strong>タグ:</strong>
                      {memory.tags.map(t => `#${t.tag.name}`).join(' ')}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapPage;
