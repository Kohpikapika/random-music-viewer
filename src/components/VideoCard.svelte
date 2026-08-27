<script>
  import { formatPublishedDate } from '../lib/music.js'

  export let video
  export let liver
  export let featured = false
</script>

<article class:featured class="video-card" style={`--liver-color: ${liver.color}; --liver-tint: ${liver.tint}`}>
  <a
    class="thumbnail"
    href={`https://www.youtube.com/watch?v=${video.videoId}`}
    target="_blank"
    rel="noreferrer"
    aria-label={`${video.title}をYouTubeで見る`}
  >
    <img
      src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
      alt=""
      loading={featured ? 'eager' : 'lazy'}
    />
    <span class="play" aria-hidden="true">▶</span>
    <span class="color-line"></span>
  </a>
  <div class="video-meta">
    <span class="liver-avatar" aria-hidden="true">{liver.initial}</span>
    <div>
      <h3>
        <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noreferrer">
          {video.title}
        </a>
      </h3>
      <p>{formatPublishedDate(video.publishedAt)}</p>
    </div>
  </div>
</article>
