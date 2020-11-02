import React from "react";
import {Spinner, Intent} from "@blueprintjs/core";

export default function Loading() {
    return (<div className="wrapperCenter">
        <Spinner intent={Intent.PRIMARY} size={50}/>
    </div>);
}