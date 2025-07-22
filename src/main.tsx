import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { store } from './redux/store.ts'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.tsx'
import { NostrProvider } from './context/nostr.tsx'



createRoot(document.getElementById('root')!).render(
  <>
    <Provider store={store}>
      <BrowserRouter basename='/fedimint-web-wallet'>
        <NostrProvider>
          <App />
        </NostrProvider>
      </BrowserRouter>
    </Provider>
  </>
)