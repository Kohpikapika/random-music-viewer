import VideoCard from './VideoCard.jsx'

export default function VideoShelf({
  liver,
  videos = [],
  heading = '',
  limit = 8,
  emptyMessage = '動画の追加を待っています。',
  redrawLabel = '',
  onRedraw,
}) {
  return (
    <section
      className="video-shelf"
      id={liver.key}
      style={{ '--liver-color': liver.color, '--liver-tint': liver.tint }}
    >
      <div className="section-heading">
        <span className="section-avatar" aria-hidden="true">{liver.initial}</span>
        <h2>{heading || `${liver.name}の動画`}</h2>
        {redrawLabel && (
          <button className="shelf-redraw" type="button" onClick={onRedraw}>
            <span aria-hidden="true">↻</span> {redrawLabel}
          </button>
        )}
      </div>

      {videos.length ? (
        <div className="video-grid">
          {videos.slice(0, limit).map((video) => (
            <VideoCard key={video.videoId} video={video} liver={liver} />
          ))}
        </div>
      ) : (
        <p className="empty-state">{emptyMessage}</p>
      )}
    </section>
  )
}
