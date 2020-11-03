import React from "react";
import fs from "fs";
import url from "url";
import path from "path";
import {generatePdf} from "../lib/pdf-util";
import {getSession, useSession} from 'next-auth/client'
import {PrismaClient} from "@prisma/client";
import {Button, Card, Classes, Elevation, Intent, Position, Toaster} from "@blueprintjs/core";
import Loading from "../components/Loading";
import Body from "../components/Body";
import Header from "../components/Header";
import {useRouter} from 'next/router';

const {useState} = require("react");
const prisma = new PrismaClient();
const {useEffect} = require("react");
const format = c => c.substr(0, 1).toUpperCase() +
    c.substr(1).replace('_', ' ').toLowerCase();

export default function Download({reasons, user, direct}) {
    const router = useRouter();
    const [session, loading] = useSession();
    const [code, setCode] = useState(reasons[0].code);
    const [generating, setGenerating] = useState(false);

    useEffect(async () => {
        if (loading)
            return;

        if (!session)
            await router.push('/login');
    }, [session]);

    const dl = async (r, t) => {
        if (typeof window !== 'undefined') {
            setGenerating(true);
            const blob = await generatePdf({
                ...user,
                datesortie: t.toLocaleDateString('fr-FR'),
                heuresortie: Intl.DateTimeFormat('fr', {hour: 'numeric', minute: 'numeric'})
                    .formatToParts(t)
                    .map(v => v.value)
                    .join(''),
            }, t, r, 'certificate.pdf');

            await fetch('/api/generate');

            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob);
            link.download = 'attestation_' + Date.now() + '.pdf';
            document.body.appendChild(link)
            link.click();
            setGenerating(false);

            Toaster.create({position: Position.TOP}).show({
                intent: Intent.SUCCESS,
                message: "L'attestation a été téléchargée !"
            });
        }
    }

    useEffect(async () => {
        if (!!direct.r && !!direct.t && !!reasons.find(r => r.code === direct.r) &&
            !isNaN(parseInt(direct.t)) && !loading && !!session) {
            await dl(direct.r, new Date(Date.now() - parseInt(direct.t) * 60 * 1000));
            await router.push('/download');
        }
    }, [direct, loading, session]);


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
                <p dangerouslySetInnerHTML={{__html: reasons.find(r => r.code === code).label}}/>
                <Button icon="document" onClick={() => dl(code, new Date())} loading={generating}
                        intent={Intent.PRIMARY}>Générer</Button>
            </Card>
        </div>
    </Body>;
}

export async function getServerSideProps({req, res}) {
    const session = await getSession({req});
    if (!session) {
        res.writeHead(302, {Location: '/login'});
        res.end();
        return {props: {}};
    }

    const reasonsPath = path.join(process.cwd(), 'lib', 'reasons.json');
    const reasons = JSON.parse(fs.readFileSync(reasonsPath).toString());
    const user = await prisma.user.findOne({where: {email: session.user.email}});
    const queryData = url.parse(req.url, true).query;

    if (!user.address || user.address.trim() === '') {
        res.writeHead(302, {Location: '/settings'});
        res.end();
        return {props: {}};
    }

    return {
        props: {
            reasons,
            direct: {
                r: queryData?.r || null,
                t: queryData?.t || null
            },
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
