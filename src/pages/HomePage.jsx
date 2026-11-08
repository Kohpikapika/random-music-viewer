import { useEffect, useMemo, useState } from 'react'
import ChannelHero from '../components/ChannelHero.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import VideoCard from '../components/VideoCard.jsx'
import VideoShelf from '../components/VideoShelf.jsx'
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

const createEmptyGroupedVideos = () => Object.fromEntries(livers.map(({ key }) => [key, []]))

export default function HomePage() {
  const [groupedVideos, setGroupedVideos] = useState(createEmptyGroupedVideos)
  const [recommendations, setRecommendations] = useState([])
  const [createDate, setCreateDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeTab, setActiveTab] = useState('home')
  const [randomVideosByLiver, setRandomVideosByLiver] = useState(createEmptyGroupedVideos)

  useEffect(() => {
    document.title = 'MYME Tube | mymeの音楽を気ままに巡る非公式ファンサイト'

    let cancelled = false

    async function loadVideos() {
      try {
        const library = await loadMusicLibrary()
        const nextGroupedVideos = groupVideosByLiver(library.videos, livers)

        if (cancelled) {
          return
        }

        const eligibleVideos = filterGroupedVideos(
          nextGroupedVideos,
          livers,
          (video) => !isShortVideo(video),
        )

        setGroupedVideos(nextGroupedVideos)
        setCreateDate(library.createDate)
        setRecommendations(pickRecommendations(eligibleVideos, livers))
        setRandomVideosByLiver(
          Object.fromEntries(
            livers.map(({ key }) => [key, pickRandomVideos(nextGroupedVideos[key] ?? [])]),
          ),
        )
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
    () => filterGroupedVideos(groupedVideos, livers, (video) => !isShortVideo(video)),
    [groupedVideos],
  )
  const shortVideos = useMemo(
    () => filterGroupedVideos(groupedVideos, livers, isShortVideo),
    [groupedVideos],
  )
  const interleavedRecommendations = useMemo(
    () => interleaveVideos(regularVideos, livers),
    [regularVideos],
  )
  const formattedCreateDate = createDate
    ? new Intl.DateTimeFormat('ja-JP', { dateStyle: 'long' }).format(new Date(createDate))
    : ''

  function drawRecommendations() {
    setRecommendations(pickRecommendations(regularVideos, livers))
  }

  function drawLiverVideos(liverKey) {
    setRandomVideosByLiver((currentVideos) => ({
      ...currentVideos,
      [liverKey]: pickRandomVideos(groupedVideos[liverKey] ?? []),
    }))
  }

  return (
    <div id="top">
      <SiteHeader />
      <main>
        <ChannelHero activeTab={activeTab} onTabChange={setActiveTab} />
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
        ) : activeTab === 'recommendations' ? (
          <section className="content-section tab-video-grid" aria-label="動画一覧">
            {interleavedRecommendations.map((video) => (
              <VideoCard
                key={video.videoId}
                video={video}
                liver={liverByKey[video.channelKey]}
              />
            ))}
          </section>
        ) : activeTab === 'shorts' ? (
          <div className="content-section shelves tab-shelves">
            {livers
              .filter((liver) => shortVideos[liver.key]?.length)
              .map((liver) => (
                <VideoShelf
                  key={liver.key}
                  liver={liver}
                  videos={shortVideos[liver.key]}
                  heading={`${liver.name}のショート`}
                />
              ))}
          </div>
        ) : (
          <div className="content-section shelves single-shelf">
            {livers
              .filter((liver) => liver.key === activeTab)
              .map((liver) => (
                <VideoShelf
                  key={liver.key}
                  liver={liver}
                  videos={randomVideosByLiver[liver.key]}
                  redrawLabel="もう一回引く"
                  onRedraw={() => drawLiverVideos(liver.key)}
                />
              ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
