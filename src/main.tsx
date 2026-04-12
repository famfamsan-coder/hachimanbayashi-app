import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { hydrateFromSupabase } from './lib/hydrate'
import { IS_MOCK_MODE } from './lib/config'
import './index.css'

async function bootstrap() {
  if (!IS_MOCK_MODE) {
    await hydrateFromSupabase()
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
