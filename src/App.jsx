import HelpPage from './pages/HelpPage.jsx'
import HomePage from './pages/HomePage.jsx'
import TermsPage from './pages/TermsPage.jsx'

const pages = {
  '/': HomePage,
  '/help': HelpPage,
  '/terms': TermsPage,
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const Page = pages[path] ?? HomePage

  return <Page />
}
