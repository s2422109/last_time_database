import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path'; // ★ pathモジュールをインポート
import memoriesRouter from '../api/memories/memories.routes';
import usersRouter from '../api/users/users.routes';

const app = express();

app.use(cors());
app.use(express.json());

// ★★★ ここからが追加部分 ★★★
// 'public'ディレクトリを静的ファイルの配信元として設定します。
// これにより、http://localhost:3001/uploads/ファイル名 で画像にアクセスできるようになります。
// process.cwd()はプロジェクトのルートディレクトリを指します。
app.use('/uploads', express.static(path.join(process.cwd(), 'backend/public/uploads')));
// ★★★ ここまでが追加部分 ★★★


app.use('/api', memoriesRouter);
app.use('/api/users', usersRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running!');
});

export default app;