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
  return /#shorts/i.test(video.title ?? '')
}

export function filterGroupedVideos(groupedVideos, livers, predicate) {
  return Object.fromEntries(
    livers.map(({ key }) => [key, (groupedVideos[key] ?? []).filter(predicate)]),
  )
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
