import React from "react";
import {Alignment, Button, Navbar, Classes} from "@blueprintjs/core";
import {useRouter} from "next/router";

export default function Header({user}) {
    const router = useRouter();

    return (
        <Navbar>
            <Navbar.Group align={Alignment.LEFT}>
                <Navbar.Heading>
                    <img src={user.image} alt=""/>
                </Navbar.Heading>
                <Navbar.Divider/>
                <Navbar.Heading>
                    {user.firstname} {user.lastname}
                </Navbar.Heading>
            </Navbar.Group>
            <Navbar.Group align={Alignment.RIGHT}>
                <Button className={Classes.MINIMAL} icon="cog" onClick={() => router.push('/settings')}/>
            </Navbar.Group>
        </Navbar>
    );
}