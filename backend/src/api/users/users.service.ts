import { prisma } from '../../core/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // ★ 追加
import { User } from '@prisma/client';

// ユーザー登録処理
export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
  // パスワードをハッシュ化 (10はハッシュ化の強度)
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const newUser = await prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
    },
  });

  // パスワード情報は返さないようにする
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// ★ ログイン処理を追加
export const loginUser = async (loginData: Pick<User, 'email' | 'password'>) => {
  // 1. emailでユーザーを検索
  const user = await prisma.user.findUnique({
    where: { email: loginData.email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // 2. パスワードを比較
  const isPasswordValid = await bcrypt.compare(loginData.password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  // 3. JWTを生成
  // 'YOUR_SECRET_KEY'は.envファイルで管理するのが望ましい
  const token = jwt.sign({ userId: user.id }, 'YOUR_SECRET_KEY', {
    expiresIn: '1h', // トークンの有効期限
  });

  return { token };
};