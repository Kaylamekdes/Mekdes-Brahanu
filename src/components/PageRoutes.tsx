import { useEffect, useLayoutEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import App from '../App.tsx'
import CaseStudyPage from '../pages/CaseStudyPage.tsx'

// The site's routes, with a fade between pages: the current page's <main>
// fades out (200ms), the next page replaces it and starts at the top (or at
// the section its hash names), then fades in (300ms). The CSS is in
// index.css, keyed on data-page on the html element; the nav sits outside
// <main>, so it stays put. Back and forward swap at once and only fade in,
// because the browser restores their scroll position straight away. Links
// within a page (#work on the home page) are plain anchors the router never
// sees.
const FADE_OUT = 200
const root = document.documentElement

export default function PageRoutes() {
  const location = useLocation()
  const type = useNavigationType()
  const [shown, setShown] = useState(location)

  // A new location: fade the current page out, then show the new one
  useEffect(() => {
    if (location.key === shown.key) return
    root.dataset.page = 'out'
    const timer = setTimeout(() => setShown(location), type === 'POP' ? 0 : FADE_OUT)
    return () => clearTimeout(timer)
  }, [location, shown.key, type])

  // The new page is in, still transparent: scroll it into place, then fade it
  // in on the next frame (two frames, so the hash target has its layout).
  useLayoutEffect(() => {
    if (root.dataset.page !== 'out') return
    let frame = requestAnimationFrame(() => {
      if (type !== 'POP') {
        if (shown.hash) document.getElementById(shown.hash.slice(1))?.scrollIntoView()
        else window.scrollTo(0, 0)
      }
      frame = requestAnimationFrame(() => delete root.dataset.page)
    })
    return () => cancelAnimationFrame(frame)
  }, [shown, type])

  return (
    <Routes location={shown}>
      <Route path="/" element={<App />} />
      <Route path="/work/:slug" element={<CaseStudyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
