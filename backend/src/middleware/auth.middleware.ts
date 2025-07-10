import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ExpressのRequest型を拡張して、userプロパティを追加
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. リクエストヘッダーから'Authorization'を取得
  const authHeader = req.headers.authorization;

  // 2. ヘッダーが存在し、'Bearer 'で始まるか確認
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  // 3. 'Bearer '部分を取り除き、トークンを抽出
  const token = authHeader.split(' ')[1];

  try {
    // 4. トークンを検証
    const decoded = jwt.verify(token, 'YOUR_SECRET_KEY') as { userId: number };
    // 5. 検証成功なら、リクエストオブジェクトにユーザー情報を格納
    req.user = { userId: decoded.userId };
    // 6. 次の処理へ進む
    next();
  } catch (error) {
    // 7. トークンが無効ならエラーを返す
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};