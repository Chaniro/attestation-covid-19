import React, {useState} from 'react';
import {Alignment, Button, Navbar, Classes, Intent, Alert, Card} from '@blueprintjs/core';
import {useRouter} from 'next/router';
import {signOut} from 'next-auth/client'

export default function Header({user}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const deleteUser = async () => {
        const requestOptions = {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'}
        };

        const res = await fetch('/api/user', requestOptions);
        if (res.status === 200) {
            signOut();
        }
        else {
            setOpen(false);
        }
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
