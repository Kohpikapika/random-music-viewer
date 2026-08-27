<script>
  import { onMount } from 'svelte'
  import ChannelHero from '../components/ChannelHero.svelte'
  import SiteFooter from '../components/SiteFooter.svelte'
  import SiteHeader from '../components/SiteHeader.svelte'
  import VideoCard from '../components/VideoCard.svelte'
  import VideoShelf from '../components/VideoShelf.svelte'
  import { livers, liverByKey } from '../lib/livers.js'
  import {
    filterGroupedVideos,
    groupVideosByLiver,
    interleaveVideos,
    isShortVideo,
    loadMusicLibrary,
    pickRecommendations,
    pickRandomVideos,
  } from '../lib/music.js'

  let groupedVideos = Object.fromEntries(livers.map(({ key }) => [key, []]))
  let recommendations = []
  let createDate = ''
  let loading = true
  let errorMessage = ''
  let activeTab = 'home'
  let randomVideosByLiver = Object.fromEntries(livers.map(({ key }) => [key, []]))

  function drawRecommendations() {
    const eligibleVideos = filterGroupedVideos(groupedVideos, livers, (video) => !isShortVideo(video))
    recommendations = pickRecommendations(eligibleVideos, livers)
  }

  function drawLiverVideos(liverKey) {
    randomVideosByLiver = {
      ...randomVideosByLiver,
      [liverKey]: pickRandomVideos(groupedVideos[liverKey] ?? []),
    }
  }

  function drawAllLiverVideos() {
    randomVideosByLiver = Object.fromEntries(
      livers.map(({ key }) => [key, pickRandomVideos(groupedVideos[key] ?? [])]),
    )
  }

  onMount(async () => {
    try {
      const library = await loadMusicLibrary()
      groupedVideos = groupVideosByLiver(library.videos, livers)
      createDate = library.createDate
      drawRecommendations()
      drawAllLiverVideos()
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : '動画データを読み込めませんでした。'
    } finally {
      loading = false
    }
  })

  $: formattedCreateDate = createDate
    ? new Intl.DateTimeFormat('ja-JP', { dateStyle: 'long' }).format(new Date(createDate))
    : ''
  $: regularVideos = filterGroupedVideos(groupedVideos, livers, (video) => !isShortVideo(video))
  $: shortVideos = filterGroupedVideos(groupedVideos, livers, isShortVideo)
  $: interleavedRecommendations = interleaveVideos(regularVideos, livers)
</script>

<svelte:head>
  <title>MYME Tube | mymeの音楽を気ままに巡る非公式ファンサイト</title>
</svelte:head>

<div id="top">
  <SiteHeader />
  <main>
    <ChannelHero bind:activeTab />
    {#if loading}
      <div class="status" role="status">mymeの音楽を準備しています…</div>
    {:else if errorMessage}
      <div class="status error" role="alert">{errorMessage}</div>
    {:else}
      {#if activeTab === 'home'}
      <section class="recommendations content-section">
        <div class="content-heading">
          <div>
            <p class="eyebrow">TODAY'S PICKS</p>
            <h2>今日のmymeランダムガチャ</h2>
            <p>3人それぞれから、今日の2曲を選びました。</p>
          </div>
          <button type="button" on:click={drawRecommendations}><span aria-hidden="true">↻</span> もう一回引く</button>
        </div>
        <div class="recommendation-grid">
          {#each recommendations as video (video.videoId)}
            <VideoCard {video} liver={liverByKey[video.channelKey]} featured />
          {/each}
        </div>
        {#if formattedCreateDate}
          <p class="updated-at">{formattedCreateDate} 時点で投稿されている動画からピックアップ</p>
        {/if}
      </section>

      {:else if activeTab === 'recommendations'}
        <section class="content-section tab-video-grid" aria-label="動画一覧">
          {#each interleavedRecommendations as video (video.videoId)}
            <VideoCard {video} liver={liverByKey[video.channelKey]} />
          {/each}
        </section>
      {:else if activeTab === 'shorts'}
        <div class="content-section shelves tab-shelves">
          {#each livers.filter((liver) => shortVideos[liver.key]?.length) as liver}
            <VideoShelf
              {liver}
              videos={shortVideos[liver.key]}
              heading={`${liver.name}のショート`}
            />
          {/each}
        </div>
      {:else}
        <div class="content-section shelves single-shelf">
          {#each livers.filter((liver) => liver.key === activeTab) as liver}
            <VideoShelf
              {liver}
              videos={randomVideosByLiver[liver.key]}
              redrawLabel="もう一回引く"
              on:redraw={() => drawLiverVideos(liver.key)}
            />
          {/each}
        </div>
      {/if}
    {/if}
  </main>
  <SiteFooter />
</div>
