import { getSession } from 'next-auth/client'
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export default async (req, res) => {
  const session = await getSession({ req })
  if (req.method === 'POST' && !!session) {
    delete req.body.image;
    await prisma.user.update({
      where: {email: session.user.email},
      data: req.body,
    });

    res.statusCode = 200;
    res.end(session.user.email);
  }
  else {
    res.statusCode = 404;
  }
}
