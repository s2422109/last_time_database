import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// ローカルのassetsフォルダからカスタム画像をインポート
import customPinUrl from '../assets/kkrn_icon_pin_4.png'; 

const customIcon = new L.Icon({
  iconUrl: customPinUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Memory {
  id: number;
  comment: string;
  imageUrl: string;
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
          ? `http://localhost:8000/api/memories/list.php?tags=${encodeURIComponent(formattedSearchTerm)}`
          : 'http://localhost:8000/api/memories/list.php';
        
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // ★★★ ここが最終的な修正点 ★★★
        // APIから受け取ったデータが、本当に配列かどうかをチェックします。
        if (Array.isArray(response.data)) {
          // 配列の場合のみ、stateを更新します。
          setMemories(response.data);
        } else {
          // 配列でない場合（エラーオブジェクトなど）は、コンソールにエラーを出し、
          // stateを空の配列にしてクラッシュを防ぎます。
          console.error("APIから配列ではないデータが返されました:", response.data);
          setMemories([]);
        }
        // ★★★ ここまでが最終的な修正点 ★★★

      } catch (error) {
        console.error("データの取得に失敗しました:", error);
        setMemories([]); // CATCH句でも空配列をセットしてクラッシュを防ぐ
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
      {/* ... (検索フォーム部分は変更なし) ... */}
      
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
            <Marker key={memory.id} position={[memory.latitude, memory.longitude]} icon={customIcon}>
              <Popup>
                <div>
                  <img 
                    src={`http://localhost:8000/api/memories/image.php?file=${memory.imageUrl}`}
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
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapPage;
