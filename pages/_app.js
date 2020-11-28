import '../styles/globals.css'
import 'normalize.css/normalize.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import { Provider } from 'next-auth/client'
import Head from "next/head";
import React from "react";

function MyApp({ Component, pageProps }) {
  return (
      <Provider session={pageProps.session}>
          <Head>
              <title>Attestation COVID-19</title>

              <meta charSet='utf-8'/>
              <meta httpEquiv='X-UA-Compatible' content='IE=edge'/>
              <meta name='viewport' content='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no'/>

              <link rel="manifest" href="/manifest.json"/>
              <meta name="theme-color" content="#30404d" />
          </Head>
        <Component {...pageProps} />
      </Provider>
  );
}

export default MyApp
