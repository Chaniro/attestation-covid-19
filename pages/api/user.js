import { getSession } from 'next-auth/client'
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export default async (req, res) => {
  const session = await getSession({ req })
  if (req.method === 'DELETE' && !!session) {
    const user = await prisma.user.findOne({where: {email: session.user.email}});
    await prisma.account.deleteMany({where: {userId: user.id}});
    await prisma.session.deleteMany({where: {userId: user.id}});
    await prisma.user.delete({where: {email: session.user.email}});

    res.statusCode = 200;
    res.end(session.user.email);
  }
  else {
    res.statusCode = 404;
  }
}
