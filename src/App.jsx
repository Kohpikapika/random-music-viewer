import HelpPage from './pages/HelpPage.jsx'
import HomePage from './pages/HomePage.jsx'
import TermsPage from './pages/TermsPage.jsx'

const pages = {
  '/myme': HomePage,
  '/help': HelpPage,
  '/terms': TermsPage,
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const Page = pages[path]

  if (!Page) {
    const destination = new URL('/myme', window.location.origin)

    // 旧ルートの共有URLから移動しても、選曲や編集内容を失わないようにする。
    destination.search = window.location.search
    destination.hash = window.location.hash
    window.location.replace(`${destination.pathname}${destination.search}${destination.hash}`)
    return null
  }

  return <Page />
}
