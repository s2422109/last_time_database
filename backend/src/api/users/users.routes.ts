import { Router } from 'express';
import { createUser, loginUser } from './users.service'; // ★ loginUserを追加

const router = Router();

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    // リクエストのbodyからユーザー情報を取得
    const newUser = await createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    // emailの重複などでエラーが起きる可能性がある
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (error) {
    // ユーザーが見つからない、またはパスワードが違う場合
    res.status(401).json({ error: 'Invalid email or password' });
  }
});


export default router;