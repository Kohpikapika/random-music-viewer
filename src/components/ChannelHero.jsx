import { livers, mymeChannel } from '../lib/livers.js'

const tabs = [
  { id: 'home', label: 'ホーム' },
  { id: 'recommendations', label: '動画' },
  { id: 'shorts', label: 'ショート' },
  // mymeはメンバー固有色を持たないため、ホームやショートと同じ3色下線を使う。
  { id: mymeChannel.key, label: mymeChannel.name },
  ...livers.map((liver) => ({ id: liver.key, label: liver.name, color: liver.color })),
]

export default function ChannelHero({ activeTab, onTabChange }) {
  return (
    <section className="channel-shell" aria-labelledby="channel-title">
      <div className="channel-banner">
        <p className="fan-label">UNOFFICIAL FAN SITE</p>
        <strong>3人の音楽を、気ままに巡る。</strong>
        <span>MYME Tube · 繭糸 · みちとせ · それ故</span>
      </div>

      <div className="channel-info">
        <div className="channel-avatar" aria-hidden="true">M</div>
        <div className="channel-copy">
          <h1 id="channel-title">MYME Tube <small>非公式ファンサイト</small></h1>
          <p className="channel-description">3人の声と音楽が重なる場所。今日はどの曲に出会えるでしょう。</p>
          <div className="member-list" aria-label="mymeメンバー">
            {livers.map((liver) => (
              <span
                key={liver.key}
                style={{ '--member-color': liver.color, '--member-tint': liver.tint }}
              >
                <i aria-hidden="true">{liver.initial}</i>{liver.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <nav className="channel-nav" aria-label="動画表示メニュー">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${activeTab === tab.id ? 'active' : ''}${tab.color ? ' member-tab' : ''}`}
            style={tab.color ? { '--tab-color': tab.color } : undefined}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </section>
  )
}
