import React from "react";
import Loading from "../components/Loading";
import {getSession, useSession} from "next-auth/client";
import {Button, Card, Classes, Elevation, FormGroup, InputGroup, Intent} from "@blueprintjs/core";
import Body from "../components/Body";
import {useRouter} from "next/router";
import Header from "../components/Header";
import {PrismaClient} from "@prisma/client";

const {useState} = require("react");
const prisma = new PrismaClient();

const isEmpty = str => !str || str.trim() === '';
const isCorrect = u => !isEmpty(u.lastname) &&
    !isEmpty(u.firstname) &&
    !isEmpty(u.birthday) &&
    !isEmpty(u.placeofbirth) &&
    !isEmpty(u.address) &&
    !isEmpty(u.city) &&
    !isEmpty(u.zipcode);


export default function Settings({u}) {
    const router = useRouter();
    const [_, loading] = useSession();
    const [fetching, setFetching] = useState(false);
    const [user, setUser] = useState({
        ...u,
        birthday: isEmpty(u.birthday) ? '' : u.birthday.split('/').reverse().join('-')
    });

    const set = field => event => {
        let v = event.target.value;
        if (field === 'firstname')
            v = v.substr(0, 1).toUpperCase() + v.substr(1).toLowerCase();
        else if (field === 'lastname')
            v = v.toUpperCase();

        setUser({...user, [field]: v});
    }

    const save = async () => {
        setFetching(true);
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                ...user,
                birthday: user.birthday.split('-').reverse().join('/')
            })
        };

        const res = await fetch('/api/settings', requestOptions);
        if (res.status === 200)
            await router.push('/download');
        else
            setFetching(false);
    }

    return loading ? <Loading/> : <Body>
        <Header user={user}/>
        <div className="wrapperCenter">
            <Card elevation={Elevation.THREE} id="settings">
                <h3 className={Classes.HEADING}>Informations</h3>
                <FormGroup label="Prénom" labelFor="firstname" labelInfo="(*)">
                    <InputGroup id="firstname" placeholder="Camille" value={user.firstname}
                                onChange={set('firstname')}/>
                </FormGroup>
                <FormGroup label="Nom" labelFor="lastname" labelInfo="(*)">
                    <InputGroup id="lastname" placeholder="Dupont" value={user.lastname} onChange={set('lastname')}/>
                </FormGroup>
                <FormGroup label="Date de naissance" labelFor="birthday" labelInfo="(*)">
                    <InputGroup id="birthday" placeholder="01/01/1970" type="date" value={user.birthday}
                                onChange={set('birthday')}/>
                </FormGroup>
                <FormGroup label="Lieu de naissance" labelFor="placeofbirth" labelInfo="(*)">
                    <InputGroup id="placeofbirth" placeholder="Rennes" value={user.placeofbirth}
                                onChange={set('placeofbirth')}/>
                </FormGroup>
                <FormGroup label="Adresse" labelFor="address" labelInfo="(*)">
                    <InputGroup id="address" placeholder="2 allée des cerises" value={user.address}
                                onChange={set('address')}/>
                </FormGroup>
                <FormGroup label="Ville" labelFor="city" labelInfo="(*)">
                    <InputGroup id="city" placeholder="Rennes" value={user.city} onChange={set('city')}/>
                </FormGroup>
                <FormGroup label="Code postal" labelFor="zipcode" labelInfo="(*)">
                    <InputGroup id="zipcode" placeholder="35000" value={user.zipcode} onChange={set('zipcode')}/>
                </FormGroup>

                <div className="text-center">
                    <Button intent={Intent.SUCCESS}
                            onClick={save}
                            disabled={!isCorrect(user)}
                            loading={fetching}>Sauvegarder</Button>
                </div>
            </Card>
        </div>
    </Body>
}


export async function getServerSideProps({req, res}) {
    const session = await getSession({req});
    if (!session) {
        res.writeHead(302, {Location: '/api/auth/signin'});
        res.end();
        return {props: {}};
    }

    const user = await prisma.user.findOne({where: {email: session.user.email}});

    return {
        props: {
            u: {
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