import { useEffect, useMemo, useState } from 'react'
import ChannelHero from '../components/ChannelHero.jsx'
import PickBuilder from '../components/PickBuilder.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import VideoCard from '../components/VideoCard.jsx'
import VideoShelf from '../components/VideoShelf.jsx'
import { createPickImageBlob } from '../lib/pickImage.js'
import { livers, liverByKey, mymeChannel } from '../lib/livers.js'
import {
  createSharedPickUrl,
  DEFAULT_PICK_TITLE,
  filterGroupedVideos,
  groupVideosByLiver,
  isMymeRadioArchive,
  isShortVideo,
  loadMusicLibrary,
  parseSharedPickIds,
  pickRecommendations,
  sortVideosNewestFirst,
} from '../lib/music.js'

const createEmptyGroupedVideos = () => Object.fromEntries(livers.map(({ key }) => [key, []]))
const getChannelInfo = (video) => (
  video.channelKey === mymeChannel.key ? mymeChannel : liverByKey[video.channelKey]
)
const isPickableVideo = (video) => (
  Boolean(getChannelInfo(video)) && !isShortVideo(video) && !isMymeRadioArchive(video)
)

export default function HomePage() {
  const initialSharedPickIds = parseSharedPickIds(window.location.search)
  const [groupedVideos, setGroupedVideos] = useState(createEmptyGroupedVideos)
  const [mymeVideos, setMymeVideos] = useState([])
  const [allVideos, setAllVideos] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [createDate, setCreateDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeTab, setActiveTab] = useState('home')
  const [selectedVideoIds, setSelectedVideoIds] = useState(initialSharedPickIds)
  const [selectionMode, setSelectionMode] = useState(initialSharedPickIds.length > 0)
  const [pickTitle, setPickTitle] = useState(DEFAULT_PICK_TITLE)
  const [customPickTitles, setCustomPickTitles] = useState({})
  const [pickNotice, setPickNotice] = useState('')

  useEffect(() => {
    document.title = 'MYME Tube | mymeの音楽を気ままに巡る非公式ファンサイト'

    let cancelled = false

    async function loadVideos() {
      try {
        const library = await loadMusicLibrary()
        const nextGroupedVideos = groupVideosByLiver(library.videos, livers)
        const nextMymeVideos = library.videos.filter(
          (video) => video.channelKey === mymeChannel.key && !isShortVideo(video),
        )
        const availablePickIds = new Set(
          library.videos.filter(isPickableVideo).map((video) => video.videoId),
        )
        const validSharedPickIds = parseSharedPickIds(window.location.search)
          .filter((videoId) => availablePickIds.has(videoId))

        if (cancelled) {
          return
        }

        const eligibleVideos = filterGroupedVideos(
          nextGroupedVideos,
          livers,
          (video) => !isShortVideo(video),
        )

        setGroupedVideos(nextGroupedVideos)
        setMymeVideos(nextMymeVideos)
        setAllVideos(library.videos)
        setSelectedVideoIds(validSharedPickIds)
        setSelectionMode(validSharedPickIds.length > 0)
        setCreateDate(library.createDate)
        setRecommendations(pickRecommendations(eligibleVideos, livers))
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : '動画データを読み込めませんでした。',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadVideos()

    return () => {
      cancelled = true
    }
  }, [])

  const regularVideos = useMemo(
    () => Object.fromEntries(
      Object.entries(filterGroupedVideos(
        groupedVideos,
        livers,
        (video) => !isShortVideo(video),
      )).map(([key, videos]) => [key, sortVideosNewestFirst(videos)]),
    ),
    [groupedVideos],
  )
  const shortVideos = useMemo(
    () => Object.fromEntries(
      Object.entries(filterGroupedVideos(groupedVideos, livers, isShortVideo))
        .map(([key, videos]) => [key, sortVideosNewestFirst(videos)]),
    ),
    [groupedVideos],
  )
  const mymeMusicVideos = useMemo(
    () => mymeVideos.filter((video) => !isMymeRadioArchive(video)),
    [mymeVideos],
  )
  const mymeRadioArchives = useMemo(
    () => mymeVideos.filter(isMymeRadioArchive),
    [mymeVideos],
  )
  const videosById = useMemo(
    () => new Map(allVideos.map((video) => [video.videoId, video])),
    [allVideos],
  )
  const selectedVideos = useMemo(
    () => selectedVideoIds.map((videoId) => videosById.get(videoId)).filter(Boolean),
    [selectedVideoIds, videosById],
  )
  const selectedPicks = useMemo(
    () => selectedVideos.map((video) => ({
      video,
      channel: getChannelInfo(video),
      displayTitle: Object.hasOwn(customPickTitles, video.videoId)
        ? customPickTitles[video.videoId]
        : video.title,
    })),
    [customPickTitles, selectedVideos],
  )
  const selectionLimitReached = selectedVideoIds.length >= 3
  const formattedCreateDate = createDate
    ? new Intl.DateTimeFormat('ja-JP', { dateStyle: 'long' }).format(new Date(createDate))
    : ''

  function drawRecommendations() {
    setRecommendations(pickRecommendations(regularVideos, livers))
  }

  function randomizePicks() {
    const randomVideos = livers.map(({ key }) => {
      const videos = regularVideos[key] ?? []
      return videos[Math.floor(Math.random() * videos.length)]
    }).filter(Boolean)

    removePicksFromUrl()
    setSelectionMode(true)
    setSelectedVideoIds(randomVideos.map((video) => video.videoId))
    setCustomPickTitles({})
    setPickNotice(
      randomVideos.length === livers.length
        ? '繭糸・みちとせ・それ故から1曲ずつ選びました。'
        : '3人分の動画を揃えられませんでした。',
    )
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById('pick-builder')?.scrollIntoView({ behavior: 'smooth' })
      })
    })
  }

  function toggleVideoSelection(videoId) {
    // 共有URLを編集中に古い3曲が復元されないよう、選択変更時点でクエリを外す。
    removePicksFromUrl()
    setPickNotice('')
    setSelectedVideoIds((currentIds) => {
      if (currentIds.includes(videoId)) {
        return currentIds.filter((currentId) => currentId !== videoId)
      }

      return currentIds.length < 3 ? [...currentIds, videoId] : currentIds
    })
  }

  function updateSharedUrl() {
    const shareUrl = createSharedPickUrl(window.location.href, selectedVideoIds)
    const url = new URL(shareUrl)

    window.history.replaceState(null, '', `${url.pathname}${url.search}`)
    return shareUrl
  }

  async function copySharedUrl() {
    const shareUrl = updateSharedUrl()

    try {
      await navigator.clipboard.writeText(shareUrl)
      setPickNotice('共有URLをコピーしました。')
    } catch {
      setPickNotice('URLをコピーできませんでした。ブラウザのアドレス欄からコピーしてください。')
    }
  }

  function shareOnX() {
    const shareUrl = updateSharedUrl()
    const parameters = new URLSearchParams({
      text: `${pickTitle || DEFAULT_PICK_TITLE}を選びました🎧\n#myme #MYMETube`,
      url: shareUrl,
    })

    window.open(`https://twitter.com/intent/tweet?${parameters}`, '_blank', 'noopener,noreferrer')
    setPickNotice('Xの投稿画面を開きました。保存した画像を添付してください。')
  }

  async function downloadPickImage() {
    try {
      const blob = await createPickImageBlob(selectedPicks, pickTitle || DEFAULT_PICK_TITLE)
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = downloadUrl
      link.download = 'myme-3-picks.png'
      link.click()
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 0)
      updateSharedUrl()
      setPickNotice('画像を保存しました。Xの投稿画面で添付できます。')
    } catch {
      setPickNotice('画像を生成できませんでした。時間をおいてもう一度お試しください。')
    }
  }

  function removePicksFromUrl() {
    const url = new URL(window.location.href)

    url.searchParams.delete('picks')
    url.searchParams.delete('title')
    url.searchParams.delete('labels')
    window.history.replaceState(null, '', `${url.pathname}${url.search}`)
  }

  function clearPicks() {
    removePicksFromUrl()
    setSelectedVideoIds([])
    setCustomPickTitles({})
    setPickNotice('')
  }

  function cancelSelection() {
    clearPicks()
    setPickTitle(DEFAULT_PICK_TITLE)
    setSelectionMode(false)
  }

  function showPickBuilder() {
    setSelectionMode(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById('pick-builder')?.scrollIntoView({ behavior: 'smooth' })
      })
    })
  }

  return (
    <div id="top">
      <SiteHeader />
      <main>
        <ChannelHero activeTab={activeTab} onTabChange={setActiveTab} />
        {!loading && !errorMessage && (
          <PickBuilder
            active={selectionMode}
            picks={selectedPicks}
            title={pickTitle}
            notice={pickNotice}
            onStart={showPickBuilder}
            onCancel={cancelSelection}
            onClear={clearPicks}
            onCopy={copySharedUrl}
            onDownload={downloadPickImage}
            onPickTitleChange={(videoId, title) => {
              removePicksFromUrl()
              setCustomPickTitles((currentTitles) => ({
                ...currentTitles,
                [videoId]: title,
              }))
              setPickNotice('')
            }}
            onRandomize={randomizePicks}
            onRemove={toggleVideoSelection}
            onShare={shareOnX}
            onTitleChange={(title) => {
              removePicksFromUrl()
              setPickTitle(title)
              setPickNotice('')
            }}
          />
        )}
        {loading ? (
          <div className="status" role="status">mymeの音楽を準備しています…</div>
        ) : errorMessage ? (
          <div className="status error" role="alert">{errorMessage}</div>
        ) : activeTab === 'home' ? (
          <section className="recommendations content-section">
            <div className="content-heading">
              <div>
                <p className="eyebrow">TODAY&apos;S PICKS</p>
                <h2>今日のmymeランダムガチャ</h2>
                <p>3人それぞれから、今日の2曲を選びました。</p>
              </div>
              <button type="button" onClick={drawRecommendations}>
                <span aria-hidden="true">↻</span> もう一回引く
              </button>
            </div>
            <div className="recommendation-grid">
              {recommendations.map((video) => (
                <VideoCard
                  key={video.videoId}
                  video={video}
                  liver={liverByKey[video.channelKey]}
                  selected={selectedVideoIds.includes(video.videoId)}
                  selectionOrder={selectedVideoIds.indexOf(video.videoId) + 1}
                  selectionDisabled={selectionLimitReached}
                  onToggleSelection={selectionMode ? toggleVideoSelection : undefined}
                  featured
                />
              ))}
            </div>
            {formattedCreateDate && (
              <p className="updated-at">
                {formattedCreateDate} 時点で投稿されている動画からピックアップ
              </p>
            )}
          </section>
        ) : activeTab === mymeChannel.key ? (
          <div className="content-section shelves myme-shelves">
            <VideoShelf
              liver={mymeChannel}
              videos={mymeMusicVideos}
              heading="mymeのオリジナル曲"
              limit={mymeMusicVideos.length}
              emptyMessage="オリジナル曲の追加を待っています。"
              selectedVideoIds={selectedVideoIds}
              selectionLimitReached={selectionLimitReached}
              canSelectVideo={selectionMode ? isPickableVideo : undefined}
              onToggleSelection={selectionMode ? toggleVideoSelection : undefined}
            />
            <VideoShelf
              liver={mymeChannel}
              videos={mymeRadioArchives}
              heading="「一日、一ゆるみ。」アーカイブ"
              limit={mymeRadioArchives.length}
              emptyMessage="ラジオアーカイブの追加を待っています。"
            />
          </div>
        ) : (
          <div className="content-section shelves single-shelf">
            {livers
              .filter((liver) => liver.key === activeTab)
              .map((liver) => (
                <VideoShelf
                  key={`${liver.key}-videos`}
                  liver={liver}
                  videos={regularVideos[liver.key]}
                  heading={`${liver.name}の動画`}
                  limit={8}
                  loadMoreStep={8}
                  selectedVideoIds={selectedVideoIds}
                  selectionLimitReached={selectionLimitReached}
                  canSelectVideo={selectionMode ? isPickableVideo : undefined}
                  onToggleSelection={selectionMode ? toggleVideoSelection : undefined}
                />
              ))}
            {livers
              .filter((liver) => liver.key === activeTab)
              .map((liver) => (
                <VideoShelf
                  key={`${liver.key}-shorts`}
                  liver={liver}
                  videos={shortVideos[liver.key]}
                  heading={`${liver.name}のショート`}
                  limit={8}
                  loadMoreStep={8}
                  emptyMessage="ショートの追加を待っています。"
                />
              ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
