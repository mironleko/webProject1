// pages/api/addUser.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { user } = req.body;

  if (!user) {
    return res.status(400).json({ error: 'User data is required' });
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      auth0Id: user.sub, // Assuming `sub` is the unique Auth0 user ID
    },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        auth0Id: user.sub,
        email: user.email,
        name: user.name,
        // ... any other fields you want to save
      },
    });
  }

  res.status(200).json({ success: true });
}
