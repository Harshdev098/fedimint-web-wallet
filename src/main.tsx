import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { store } from './redux/store.ts'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.tsx'
import { NostrProvider } from './context/nostr.tsx'
import { initialize } from '@fedimint/core-web'


const initApp = async () => {
  try {
    await initialize()
    console.log('Fedimint SDK initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Fedimint SDK:', error)
  }
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
}

initApp()