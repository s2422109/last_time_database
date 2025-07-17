import { Router, Request, Response } from 'express'; // ★ Request, Response をインポート
import { getAllMemories, createMemory } from './memories.service';
import { authMiddleware } from '../../middleware/auth.middleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// ★ reqとresに型を指定
router.get('/memories', authMiddleware, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  try {
    const tagsQuery = req.query.tags as string | undefined;
    const authorId = req.user.userId;
    const memories = await getAllMemories(authorId, tagsQuery);
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// ★ reqとresに型を指定
router.post(
  '/memories',
  authMiddleware,
  upload.single('image'),
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    try {
      const { comment, latitude, longitude, tags } = req.body;
      const authorId = req.user.userId;
      const imageUrl = 'https://example.com/placeholder.jpg';
      const newMemory = await createMemory({
        comment,
        imageUrl,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        authorId,
        tags: tags ? JSON.parse(tags) : [],
      });
      res.status(201).json(newMemory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create memory' });
    }
  }
);

export default router;
