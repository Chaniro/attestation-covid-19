import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import Adapters from 'next-auth/adapters'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const options = {
    providers: [
        Providers.Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    adapter: Adapters.Prisma.Adapter({ prisma }),
    secret: process.env.SECRET || "dev_secret",
    events: {
        createUser: async (message) => { console.log('createUser', message) },
        error: async (message) => { console.log('error', message) }
    },
    debug: process.env.DEBUG === 'true' || false,
}

export default (req, res) => NextAuth(req, res, options)
