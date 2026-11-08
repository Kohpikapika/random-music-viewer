import { useEffect, useState } from 'react'
import VideoCard from './VideoCard.jsx'

export default function VideoShelf({
  liver,
  videos = [],
  heading = '',
  limit = 8,
  loadMoreStep = 0,
  loadMoreLabel = 'もっと見る',
  emptyMessage = '動画の追加を待っています。',
  selectedVideoIds = [],
  selectionLimitReached = false,
  canSelectVideo,
  onToggleSelection,
}) {
  const [visibleCount, setVisibleCount] = useState(limit)

  useEffect(() => {
    setVisibleCount(limit)
  }, [limit, videos])

  const displayedVideos = videos.slice(0, visibleCount)
  const canLoadMore = loadMoreStep > 0 && visibleCount < videos.length

  return (
    <section
      className={`video-shelf${liver.isGroup ? ' group-channel' : ''}`}
      id={liver.key}
      style={{ '--liver-color': liver.color, '--liver-tint': liver.tint }}
    >
      <div className="section-heading">
        <span className="section-avatar" aria-hidden="true">{liver.initial}</span>
        <h2>{heading || `${liver.name}の動画`}</h2>
      </div>

      {videos.length ? (
        <>
          <div className="video-grid">
            {displayedVideos.map((video) => {
              const isSelectable = canSelectVideo?.(video) ?? false

              return (
                <VideoCard
                  key={video.videoId}
                  video={video}
                  liver={liver}
                  selected={selectedVideoIds.includes(video.videoId)}
                  selectionOrder={selectedVideoIds.indexOf(video.videoId) + 1}
                  selectionDisabled={selectionLimitReached}
                  onToggleSelection={isSelectable ? onToggleSelection : undefined}
                />
              )
            })}
          </div>
          {canLoadMore && (
            <button
              className="shelf-load-more"
              type="button"
              onClick={() => setVisibleCount((count) => count + loadMoreStep)}
            >
              {loadMoreLabel}
              <span aria-hidden="true">↓</span>
            </button>
          )}
        </>
      ) : (
        <p className="empty-state">{emptyMessage}</p>
      )}
    </section>
  )
}
