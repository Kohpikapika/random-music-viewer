export default function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="MYME Tube ホーム">
        <span className="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        <span>MYME Tube</span>
      </a>
      <span className="site-note">非公式ファンサイト</span>
    </header>
  )
}
