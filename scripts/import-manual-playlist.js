import { readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getYouTubeAccessToken, loadLocalEnv } from './youtube-oauth-client.js'

const MANUAL_JSON_PATH = path.resolve('public/music.manual.json')
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

function readArgument(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : ''
}

function getPlaylistId(value) {
  if (!value) {
    return ''
  }

  try {
    const url = new URL(value)
    return url.searchParams.get('list') ?? ''
  } catch {
    return value
  }
}

async function requestYouTube(resource, parameters, accessToken) {
  const query = new URLSearchParams(parameters)
  const response = await fetch(`${YOUTUBE_API_BASE}/${resource}?${query}`, {
    headers: { authorization: `Bearer ${accessToken}` },
  })
  const json = await response.json().catch(() => ({}))

  if (!response.ok || json.error) {
    const message = json.error?.message ?? `${response.status} ${response.statusText}`
    throw new Error(`YouTube Data API error: ${message}`)
  }

  return json
}

async function fetchPlaylistVideoIds(playlistId, accessToken) {
  const videoIds = []
  let pageToken = ''

  do {
    const json = await requestYouTube(
      'playlistItems',
      {
        part: 'contentDetails',
        playlistId,
        maxResults: '50',
        ...(pageToken ? { pageToken } : {}),
      },
      accessToken,
    )

    videoIds.push(
      ...(json.items ?? [])
        .map((item) => item.contentDetails?.videoId)
        .filter(Boolean),
    )
    pageToken = json.nextPageToken ?? ''
  } while (pageToken)

  return [...new Set(videoIds)]
}

async function fetchVideoDetails(videoIds, channelKey, accessToken) {
  const videos = []

  for (let index = 0; index < videoIds.length; index += 50) {
    const json = await requestYouTube(
      'videos',
      {
        part: 'snippet',
        id: videoIds.slice(index, index + 50).join(','),
        maxResults: '50',
      },
      accessToken,
    )

    videos.push(
      ...(json.items ?? []).map((video) => ({
        channelKey,
        title: video.snippet.title,
        videoId: video.id,
        publishedAt: video.snippet.publishedAt,
      })),
    )
  }

  return videos
}

function mergeVideos(existingVideos, importedVideos) {
  const order = []
  const videosById = new Map()

  for (const video of existingVideos) {
    if (!video?.videoId) {
      continue
    }

    if (!videosById.has(video.videoId)) {
      order.push(video.videoId)
    }

    videosById.set(video.videoId, video)
  }

  let added = 0
  let updated = 0

  for (const video of importedVideos) {
    if (videosById.has(video.videoId)) {
      updated += 1
      const existingVideo = videosById.get(video.videoId)

      // 手作業で設定したchannelKeyは、プレイリストの再取得時にも保持する。
      const hasExistingChannelKey = Object.prototype.hasOwnProperty.call(existingVideo, 'channelKey')

      videosById.set(video.videoId, {
        ...video,
        ...(hasExistingChannelKey ? { channelKey: existingVideo.channelKey } : {}),
      })
    } else {
      order.push(video.videoId)
      added += 1
      videosById.set(video.videoId, video)
    }
  }

  return {
    videos: order.map((videoId) => videosById.get(videoId)),
    added,
    updated,
  }
}

async function run() {
  await loadLocalEnv()

  const playlistValue = readArgument('--playlist') || process.env.YT_PLAYLIST
  const playlistId = getPlaylistId(playlistValue)
  const channelKey = readArgument('--channel-key') || process.env.YT_CHANNEL_KEY

  if (!playlistId) {
    throw new Error('YT_PLAYLIST is empty. Add a playlist URL or ID to .env.local.')
  }
  const accessToken = await getYouTubeAccessToken()
  const current = JSON.parse(await readFile(MANUAL_JSON_PATH, 'utf8'))
  const existingVideos = Array.isArray(current.videos) ? current.videos : []
  const playlistVideoIds = await fetchPlaylistVideoIds(playlistId, accessToken)

  if (!playlistVideoIds.length) {
    throw new Error(`No videos found in playlist: ${playlistId}`)
  }

  const importedVideos = await fetchVideoDetails(playlistVideoIds, channelKey, accessToken)
  if (!importedVideos.length) {
    throw new Error('No public video details could be retrieved. music.manual.json was not changed.')
  }

  const merged = mergeVideos(existingVideos, importedVideos)
  const next = { ...current, videos: merged.videos }
  // 取得途中の失敗で既存JSONを壊さないよう、一時ファイルの完成後に置き換える。
  const temporaryPath = `${MANUAL_JSON_PATH}.tmp`

  await writeFile(temporaryPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, MANUAL_JSON_PATH)

  console.log(`Playlist: ${playlistId}`)
  console.log(`Fetched: ${importedVideos.length}`)
  console.log(`Added: ${merged.added}`)
  console.log(`Updated: ${merged.updated}`)
  console.log(`Total manual videos: ${merged.videos.length}`)
}

run().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
