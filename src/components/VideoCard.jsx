import { formatPublishedDate } from '../lib/music.js'

export default function VideoCard({
  video,
  liver,
  featured = false,
  selected = false,
  selectionOrder = 0,
  selectionDisabled = false,
  onToggleSelection,
}) {
  if (!liver) {
    return null
  }

  const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`

  return (
    <article
      className={`video-card${featured ? ' featured' : ''}${liver.isGroup ? ' group-channel' : ''}${selected ? ' selected' : ''}`}
      style={{ '--liver-color': liver.color, '--liver-tint': liver.tint }}
    >
      <a
        className="thumbnail"
        href={videoUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${video.title}をYouTubeで見る`}
      >
        <img
          src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
          alt=""
          loading={featured ? 'eager' : 'lazy'}
        />
        <span className="play" aria-hidden="true">▶</span>
        <span className="color-line"></span>
      </a>
      <div className="video-meta">
        <span className="liver-avatar" aria-hidden="true">{liver.initial}</span>
        <div className="video-copy">
          <h3><a href={videoUrl} target="_blank" rel="noreferrer">{video.title}</a></h3>
          <p>{formatPublishedDate(video.publishedAt)}</p>
        </div>
        {onToggleSelection && (
          <button
            type="button"
            className="pick-toggle"
            disabled={selectionDisabled && !selected}
            aria-pressed={selected}
            onClick={() => onToggleSelection(video.videoId)}
          >
            {selected ? `${selectionOrder}曲目・選択中` : '3曲に選ぶ'}
          </button>
        )}
      </div>
    </article>
  )
}
