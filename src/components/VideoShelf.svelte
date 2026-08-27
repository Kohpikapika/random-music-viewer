<script>
  import { createEventDispatcher } from 'svelte'
  import VideoCard from './VideoCard.svelte'

  export let liver
  export let videos = []
  export let heading = ''
  export let limit = 8
  export let emptyMessage = '動画の追加を待っています。'
  export let redrawLabel = ''

  const dispatch = createEventDispatcher()
</script>

<section class="video-shelf" id={liver.key} style={`--liver-color: ${liver.color}; --liver-tint: ${liver.tint}`}>
  <div class="section-heading">
    <span class="section-avatar" aria-hidden="true">{liver.initial}</span>
    <div><p>{liver.reading}</p><h2>{heading || `${liver.name}の動画`}</h2></div>
    <span class="video-count">{videos.length} videos</span>
    {#if redrawLabel}
      <button class="shelf-redraw" type="button" on:click={() => dispatch('redraw')}>
        <span aria-hidden="true">↻</span> {redrawLabel}
      </button>
    {/if}
  </div>

  {#if videos.length}
    <div class="video-grid">
      {#each videos.slice(0, limit) as video (video.videoId)}
        <VideoCard {video} {liver} />
      {/each}
    </div>
  {:else}
    <p class="empty-state">{emptyMessage}</p>
  {/if}
</section>
