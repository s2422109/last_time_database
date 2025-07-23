import { prisma } from '../../core/db';
// ★ Prismaの型定義から、必要な型をインポートします
import type { Prisma, Tag } from '@prisma/client';

// createMemory関数
export const createMemory = async (data: {
  comment: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  authorId: number;
  tags: string[];
}) => {
  const { comment, imageUrl, latitude, longitude, authorId, tags } = data;
  
  // ★ tx に Prisma.TransactionClient という正しい型を指定します
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const newMemory = await tx.memory.create({
      data: { comment, imageUrl, latitude, longitude, authorId },
    });

    const tagOperations = tags.map((tagName) =>
      tx.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      })
    );
    const createdOrFoundTags = await Promise.all(tagOperations);
    
    // ★ mapの引数である tag にも、インポートした Tag 型を指定します
    const memoryTagData = createdOrFoundTags.map((tag: Tag) => ({
      memoryId: newMemory.id,
      tagId: tag.id,
    }));

    await tx.memoryTag.createMany({ data: memoryTagData });
    return newMemory;
  });
};

// getAllMemories関数 (変更なし)
export const getAllMemories = async (authorId: number, tagsQuery?: string) => {
  const whereClause: any = {
    authorId: authorId,
  };

  if (tagsQuery && tagsQuery.trim() !== '') {
    const tags = tagsQuery.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    if (tags.length > 0) {
      whereClause.AND = tags.map(tagName => ({
        tags: {
          some: {
            tag: {
              name: tagName,
            },
          },
        },
      }));
    }
  }

  return prisma.memory.findMany({
    where: whereClause,
    include: {
      author: { select: { id: true, name: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
};
