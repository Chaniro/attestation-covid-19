import {getSession} from 'next-auth/client'
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export default async (req, res) => {
    const session = await getSession({req})
    if (req.method === 'GET' && !!session) {
        const user = await prisma.user.findOne({where: {email: session.user.email}});
        const g = user.generated || 0;
        await prisma.user.update({
            where: {email: session.user.email},
            data: {
                generated: g + 1
            },
        });

        res.statusCode = 200;
        res.end('');
    } else {
        res.statusCode = 404;
    }
}
