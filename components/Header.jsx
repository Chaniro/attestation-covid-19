import React, {useState} from 'react';
import {Alert, Alignment, Button, Classes, Intent, Navbar, Switch} from '@blueprintjs/core';
import {useRouter} from 'next/router';
import {signOut} from 'next-auth/client'

const {useEffect} = require("react");

const DARK = 'DARK';

export default function Header({user}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const d = localStorage.getItem(DARK) === 'true' || false;
        setDark(localStorage.getItem(DARK) === 'true' || false);

        const elem = document.getElementById('main');
        if(d)
            elem.classList.add('bp3-dark');
        else
            elem.classList.remove('bp3-dark');
    }, [dark]);

    const deleteUser = async () => {
        const requestOptions = {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'}
        };

        const res = await fetch('/api/user', requestOptions);
        if (res.status === 200) {
            signOut();
        } else {
            setOpen(false);
        }
    }

    const onChange = e => {
        setDark(e.target.checked);
        localStorage.setItem(DARK, e.target.checked);
    }

    return (
        <Navbar>
            <Navbar.Group align={Alignment.LEFT}>
                <Navbar.Heading className="mr-0">
                    <img src={user.image} alt=""/>
                </Navbar.Heading>
                <Navbar.Divider/>
                <Navbar.Heading>
                    {user.firstname} {user.lastname}
                </Navbar.Heading>
            </Navbar.Group>
            <Navbar.Group align={Alignment.RIGHT}>
                <div className="styleSwapper">
                    <Switch innerLabel="🌛"
                            innerLabelChecked="☀"
                            large={true}
                            checked={dark}
                            onChange={onChange}/>
                </div>

                <Navbar.Divider/>

                <Button className={Classes.MINIMAL} icon="cog" onClick={() => router.push('/settings')}/>
                <Button className={Classes.MINIMAL} intent={Intent.DANGER} icon="trash" onClick={() => setOpen(true)}/>

                <Alert cancelButtonText="Annuler"
                       confirmButtonText="Supprimer"
                       icon="trash"
                       intent={Intent.DANGER}
                       isOpen={open}
                       canOutsideClickCancel={true}
                       onCancel={() => setOpen(false)}
                       onConfirm={deleteUser}>
                    <h4 className={Classes.HEADING}>Suppression de compte</h4>
                    <p>
                        Êtes-vous sûr de vouloir supprimer votre compte ? Toutes vos données seront effacées.
                    </p>
                </Alert>
            </Navbar.Group>
        </Navbar>
    );
}
