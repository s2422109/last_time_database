import { Router, Request, Response } from 'express'; // ★ Request, Response をインポート
import { createUser, loginUser } from './users.service';

const router = Router();

// ★ reqとresに型を指定
router.post('/register', async (req: Request, res: Response) => {
  try {
    const newUser = await createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ★ reqとresに型を指定
router.post('/login', async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

export default router;
