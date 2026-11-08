import { DEFAULT_PICK_TITLE } from '../lib/music.js'

export default function PickPreview({
  picks,
  title,
  onPickTitleChange,
  onRemove,
  onTitleChange,
}) {
  return (
    <div className="pick-preview" aria-label="お気に入りのmyme 3曲 画像プレビュー">
      <div className="pick-preview-kicker">
        <div className="pick-preview-bars" aria-hidden="true"><i></i><i></i><i></i></div>
        <p>MYME 3 PICKS</p>
      </div>
      <input
        className="pick-preview-title-input"
        type="text"
        aria-label="画像のタイトル"
        value={title}
        maxLength="32"
        placeholder={DEFAULT_PICK_TITLE}
        onChange={(event) => onTitleChange(event.target.value)}
      />
      <span>わたしが選んだ、いま聴いてほしい3曲。</span>
      <ol>
        {[0, 1, 2].map((index) => {
          const pick = picks[index]
          const displayTitle = pick?.displayTitle ?? pick?.video.title ?? ''

          return (
            <li
              key={pick?.video.videoId ?? index}
              className={`${pick ? 'filled' : ''}${pick?.channel.isGroup ? ' group-pick' : ''}`}
            >
              <b style={pick ? { '--pick-color': pick.channel.color } : undefined}>{index + 1}</b>
              <div className="pick-row-copy">
                <small>{pick ? pick.channel.name : `${index + 1}曲目`}</small>
                {pick ? (
                  <textarea
                    className="pick-preview-track-input"
                    aria-label={`${index + 1}曲目の表示タイトル`}
                    value={displayTitle}
                    maxLength="70"
                    rows="2"
                    onChange={(event) => onPickTitleChange(
                      pick.video.videoId,
                      event.target.value,
                    )}
                  />
                ) : (
                  <strong>好きな曲を選んでください</strong>
                )}
              </div>
              {pick && onRemove && (
                <div className="pick-row-actions">
                  <a
                    className="pick-video-link"
                    href={`https://www.youtube.com/watch?v=${pick.video.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${index + 1}曲目「${displayTitle}」をYouTubeで開く`}
                  >
                    <span aria-hidden="true">▶</span>
                  </a>
                  <button
                    type="button"
                    className="pick-remove"
                    aria-label={`${index + 1}曲目「${displayTitle}」を外す`}
                    onClick={() => onRemove(pick.video.videoId)}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ol>
      <footer><strong>MYME Tube</strong><span>UNOFFICIAL FAN SITE</span><b>#myme</b></footer>
    </div>
  )
}
