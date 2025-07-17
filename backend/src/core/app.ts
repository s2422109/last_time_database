import express, { Request, Response } from 'express'; // ★ Request, Response をインポート
import cors from 'cors';
import memoriesRouter from '../api/memories/memories.routes';
import usersRouter from '../api/users/users.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', memoriesRouter);
app.use('/api/users', usersRouter);

// ★ reqとresに型を指定
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running!');
});

export default app;
