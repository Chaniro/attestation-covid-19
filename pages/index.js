import React from "react";
import {getSession} from "next-auth/client";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export default function Home() {
    return (<span/>)
}

export async function getServerSideProps({req, res}) {
    const session = await getSession({req});
    const user = !session ? null : await prisma.user.findOne({where: {email: session.user.email}});

    let redirectTo = '/download';
    if (!user)
        redirectTo = '/login';
    else if (!user.address || user.address.trim() === '')
        redirectTo = '/settings';

    res.writeHead(302, {Location: redirectTo});
    res.end();
    return {props: {}};
}
