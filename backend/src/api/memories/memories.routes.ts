// backend/src/api/memories/memories.routes.ts
import { Router } from 'express';
import { getAllMemories, createMemory } from './memories.service';
import { authMiddleware } from '../../middleware/auth.middleware'; // ★ 認証ミドルウェアをインポート
import multer from 'multer'; // ★ multerをインポート

// multerのセットアップ（今回はファイルをメモリ上に一時保存する設定）
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get('/memories', async (req, res) => {
  try {
    const memories = await getAllMemories();
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// ★ POST /api/memories を追加
router.post(
  '/memories',
  authMiddleware, // 1. 最初に認証ミドルウェアを実行
  upload.single('image'), // 2. 次に画像ファイル1枚を処理
  async (req, res) => {
    // 認証ミドルウェアが成功すれば、req.userにユーザー情報が入っている
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    // multerが成功すれば、req.fileにファイル情報が入っている
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    try {
      const { comment, latitude, longitude } = req.body;
      const authorId = req.user.userId;

      // TODO: 本来は、req.fileのバッファをCloudinaryなどにアップロードし、そのURLをimageUrlに入れる
      const imageUrl = 'https://example.com/placeholder.jpg'; // 今回は仮のURL

      const newMemory = await createMemory({
        comment,
        imageUrl,
        latitude: parseFloat(latitude), // 送られてきたデータは文字列なので数値に変換
        longitude: parseFloat(longitude),
        authorId,
      });

      res.status(201).json(newMemory);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create memory' });
    }
  }
);

export default router;