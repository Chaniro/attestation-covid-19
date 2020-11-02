import React from "react";
import {Spinner, Intent, Classes} from "@blueprintjs/core";

export default function Body({ children }) {
    return (<div className={Classes.DARK + ' fh'}>
        {children}
    </div>);
}