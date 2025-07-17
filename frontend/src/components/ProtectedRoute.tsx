import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // ブラウザのlocalStorageからトークンを取得
  const token = localStorage.getItem('token');

  // もしトークンが存在すれば、子コンポーネント（ホームページなど）を表示
  // なければ、ログインページにリダイレクトする
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
