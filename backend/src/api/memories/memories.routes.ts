import { Router, Request, Response } from 'express';
import { getAllMemories, createMemory } from './memories.service';
import { authMiddleware } from '../../middleware/auth.middleware';
import multer from 'multer';
import path from 'path'; // ★ pathモジュールをインポート
import fs from 'fs';     // ★ fsモジュールをインポート

// ★★★ multerの保存設定をここから変更 ★★★
const storage = multer.diskStorage({
  // ファイルの保存先を指定
  destination: function (req, file, cb) {
    // backend/public/uploads というディレクトリを指定
    const uploadPath = path.join(process.cwd(), 'backend/public/uploads');
    // ディレクトリが存在しない場合は作成する
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  // ファイル名を指定
  filename: function (req, file, cb) {
    // ファイル名が重複しないように、現在時刻とランダムな数値を付け加える
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
// ★★★ ここまでがmulterの変更点 ★★★


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

      // ★★★ ここが修正点 ★★★
      // 保存されたファイル名から、アクセス可能なURLを組み立てる
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      const newMemory = await createMemory({
        comment,
        imageUrl, // ★ 組み立てたURLをサービスに渡す
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
