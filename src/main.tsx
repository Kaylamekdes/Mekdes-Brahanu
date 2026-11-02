import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import PageRoutes from './components/PageRoutes.tsx'

// Reveal-on-scroll content is only hidden while this class is set, so if the
// script never runs, nothing stays hidden (index.css). If the reveal system
// hasn't started within 1.5s (useReveal sets data-reveal-ready), the class
// comes off and everything shows.
const root = document.documentElement
root.classList.add('js')
setTimeout(() => {
  if (!('revealReady' in root.dataset)) root.classList.remove('js')
}, 1500)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PageRoutes />
    </BrowserRouter>
  </StrictMode>,
)
