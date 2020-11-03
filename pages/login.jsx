import React from 'react';
import {getSession} from 'next-auth/client';
import {Button, Intent} from '@blueprintjs/core';
import {signIn} from 'next-auth/client'

export default function Login() {
    console.log('login');
    return <div className="wrapperCenter">
        <Button onClick={() => signIn('google')}
                intent={Intent.PRIMARY}
                icon="log-in">Se connecter avec Google</Button>
    </div>;
}


export async function getServerSideProps({req, res}) {
    const session = await getSession({req});
    if (session) {
        res.writeHead(302, {Location: '/'});
        res.end();
    }
    return {props: {}};
}
