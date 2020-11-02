import '../styles/globals.css'
import 'normalize.css/normalize.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css'
import { Provider } from 'next-auth/client'

function MyApp({ Component, pageProps }) {
  return (
      <Provider session={pageProps.session}>
        <Component {...pageProps} />
      </Provider>
  );
}

export default MyApp
