import express from 'express';
import memoriesRouter from '../api/memories/memories.routes';
import usersRouter from '../api/users/users.routes'; // ★ 追加

const app = express();
app.use(express.json());

// APIルーターを登録
app.use('/api', memoriesRouter);
app.use('/api/users', usersRouter); // ★ 追加

app.get('/', (req, res) => {
  res.send('Server is running!');
});

export default app;