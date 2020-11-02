import React from "react";
import fs from "fs";
import path from "path";
import {generatePdf} from "../lib/pdf-util";
import {getSession, signIn, useSession} from 'next-auth/client'
import {PrismaClient} from "@prisma/client";
import {Button, Card, Classes, Elevation, Intent} from "@blueprintjs/core";
import Loading from "../components/Loading";
import Body from "../components/Body";
import Header from "../components/Header";

const {useState} = require("react");
const prisma = new PrismaClient();
const {useEffect} = require("react");
const format = c => c.substr(0, 1).toUpperCase() +
    c.substr(1).replace('_', ' ').toLowerCase();

export default function Download({reasons, user}) {
    const [session, loading] = useSession();
    const [code, setCode] = useState(reasons[0].code);

    useEffect(async () => {
        if (loading)
            return;

        if (!session)
            return signIn();
    }, [session]);

    const dl = async () => {
        if (typeof window !== 'undefined') {
            const blob = await generatePdf({
                ...user,
                datesortie: new Date().toLocaleDateString('fr-FR'),
                heuresortie: Intl.DateTimeFormat('fr', {hour: 'numeric', minute: 'numeric'})
                    .formatToParts(new Date())
                    .map(v => v.value)
                    .join(''),
            }, code, 'certificate.pdf');

            const link = document.createElement('a')
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = 'test.pdf';
            document.body.appendChild(link)
            link.click();
        }
    }

    return loading ? <Loading/> : <Body>
        <Header user={user}/>
        <div className="wrapperCenter">
            <Card className="card" elevation={Elevation.THREE}>
                <h3 className={Classes.HEADING}>Génération d'une attestation</h3>
                <div className="bp3-select">
                    <select value={code} onChange={e => setCode(e.target.value)}>
                        {reasons.map(r => (<option value={r.code} key={r.code}>{format(r.code)}</option>))}
                    </select>
                </div>
                <p>{reasons.find(r => r.code === code).label}</p>
                <Button onClick={() => dl()} intent={Intent.PRIMARY}>Générer</Button>
            </Card>
        </div>
    </Body>;
}

export async function getServerSideProps({req, res}) {
    const session = await getSession({req});
    if (!session) {
        res.writeHead(302, {Location: '/api/auth/signin'});
        res.end();
        return {props: {}};
    }

    const reasonsPath = path.join(process.cwd(), 'lib', 'reasons.json');
    const reasons = JSON.parse(fs.readFileSync(reasonsPath).toString());
    const user = await prisma.user.findOne({where: {email: session.user.email}});

    if (!user.address || user.address.trim() === '') {
        res.writeHead(302, {Location: '/settings'});
        res.end();
        return {props: {}};
    }

    return {
        props: {
            reasons,
            user: {
                image: user?.image || '',
                lastname: user?.lastname || '',
                firstname: user?.firstname || '',
                birthday: user?.birthday || '',
                placeofbirth: user?.placeofbirth || '',
                address: user?.address || '',
                zipcode: user?.zipcode || '',
                city: user?.city || ''
            }
        }
    }
}