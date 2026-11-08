export async function loadMusicLibrary() {
  const [autoResponse, manualResponse] = await Promise.all([
    fetch('/music.json'),
    fetch('/music.manual.json').catch(() => null),
  ])

  if (!autoResponse.ok) {
    throw new Error('動画データを読み込めませんでした。')
  }

  const autoData = await autoResponse.json()
  const manualData = manualResponse?.ok ? await manualResponse.json() : { videos: [] }

  const videos = mergeVideoLibraries(autoData.videos, manualData.videos)

  return {
    createDate: autoData.createDate,
    videos: videos.filter((video) => !isExcludedVideo(video)),
  }
}

export function mergeVideoLibraries(autoVideos = [], manualVideos = []) {
  const videosById = new Map()

  // 同じvideoIdが両方にある場合に、自動取得したmusic.jsonを正として扱う。
  for (const video of autoVideos ?? []) {
    videosById.set(video.videoId, video)
  }

  // 手動データは、自動取得側に存在しない動画だけを補完する。
  for (const video of manualVideos ?? []) {
    if (!videosById.has(video.videoId)) {
      videosById.set(video.videoId, video)
    }
  }

  return [...videosById.values()]
}

export function isExcludedVideo(video) {
  const title = video.title ?? ''

  // 告知・配信系の動画は、どのタブにも表示しない。
  return title.includes('受注販売') || title.includes('ライブ配信')
}

export function groupVideosByLiver(videos, livers) {
  return Object.fromEntries(
    livers.map(({ key }) => [key, videos.filter((video) => video.channelKey === key)]),
  )
}

export function pickRecommendations(groupedVideos, livers, limitPerLiver = 2) {
  const selectedByLiver = Object.fromEntries(
    livers.map(({ key }) => [key, pickRandomVideos(groupedVideos[key] ?? [], limitPerLiver)]),
  )

  return interleaveVideos(selectedByLiver, livers, limitPerLiver)
}

export function isShortVideo(video) {
  return /#\s*shorts/i.test(video.title ?? '')
}

export function isMymeRadioArchive(video) {
  const title = video.title ?? ''

  return (
    video.channelKey === 'myme' &&
    (/#いちゆる/i.test(title) || /^#\d+\s/.test(title)) &&
    !isShortVideo(video)
  )
}

export const DEFAULT_PICK_TITLE = 'お気に入りのmyme 3曲'

export function parseSharedPickIds(search = '') {
  const picks = new URLSearchParams(search).get('picks') ?? ''

  return [...new Set(picks.split(',').filter((videoId) => /^[\w-]{11}$/.test(videoId)))].slice(0, 3)
}

export function parseSharedPickTitle(search = '') {
  const title = new URLSearchParams(search).get('title')?.trim() ?? ''
  return title ? title.slice(0, 32) : DEFAULT_PICK_TITLE
}

export function parseSharedPickLabels(search = '') {
  const encodedLabels = new URLSearchParams(search).get('labels')

  if (!encodedLabels) {
    return {}
  }

  try {
    const labels = JSON.parse(encodedLabels)

    return Object.fromEntries(
      Object.entries(labels).filter(([videoId, label]) => (
        /^[\w-]{11}$/.test(videoId) && typeof label === 'string'
      )).map(([videoId, label]) => [videoId, label.slice(0, 70)]),
    )
  } catch {
    return {}
  }
}

export function createSharedPickUrl(
  currentUrl,
  videoIds,
  title = DEFAULT_PICK_TITLE,
  labels = {},
) {
  const url = new URL(currentUrl)
  url.search = ''
  url.hash = ''
  url.searchParams.set('picks', videoIds.slice(0, 3).join(','))
  if (title.trim() && title.trim() !== DEFAULT_PICK_TITLE) {
    url.searchParams.set('title', title.trim().slice(0, 32))
  }

  const selectedLabels = Object.fromEntries(
    videoIds
      .filter((videoId) => Object.hasOwn(labels, videoId))
      .map((videoId) => [videoId, labels[videoId].slice(0, 70)]),
  )
  if (Object.keys(selectedLabels).length) {
    url.searchParams.set('labels', JSON.stringify(selectedLabels))
  }

  return url.toString()
}

export function filterGroupedVideos(groupedVideos, livers, predicate) {
  return Object.fromEntries(
    livers.map(({ key }) => [key, (groupedVideos[key] ?? []).filter(predicate)]),
  )
}

export function sortVideosNewestFirst(videos = []) {
  return [...videos].sort((firstVideo, secondVideo) => {
    const firstPublishedAt = Date.parse(firstVideo.publishedAt ?? '') || 0
    const secondPublishedAt = Date.parse(secondVideo.publishedAt ?? '') || 0

    return secondPublishedAt - firstPublishedAt
  })
}

export function interleaveVideos(groupedVideos, livers, limitPerLiver = 8) {
  const videos = []

  for (let index = 0; index < limitPerLiver; index += 1) {
    for (const { key } of livers) {
      const video = groupedVideos[key]?.[index]

      if (video) {
        videos.push(video)
      }
    }
  }

  return videos
}

export function pickRandomVideos(videos, limit = 8) {
  const shuffled = [...videos]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled.slice(0, limit)
}

export function formatPublishedDate(value) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(value))
}
