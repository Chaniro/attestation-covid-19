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
              <title>Attestation</title>
              <meta name="theme-color" content="#30404d" />
          </Head>
        <Component {...pageProps} />
      </Provider>
  );
}

export default MyApp
