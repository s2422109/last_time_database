// backend/src/api/memories/memories.service.ts
import { prisma } from '../../core/db';

export const getAllMemories = async () => {
  return prisma.memory.findMany();
};

// ★ 新しい思い出を作成する関数を追加
export const createMemory = async (data: {
  comment: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  authorId: number;
}) => {
  return prisma.memory.create({
    data,
  });
};