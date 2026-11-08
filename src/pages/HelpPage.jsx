import { useEffect } from 'react'
import SiteFooter from '../components/SiteFooter.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

export default function HelpPage() {
  useEffect(() => {
    document.title = 'ヘルプ | MYME Tube'
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        'MYME Tubeのタブ、動画一覧、MYME 3 PICKSの使い方をご案内します。',
      )
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="info-page">
        <header className="info-hero help-hero">
          <p>HELP</p>
          <h1>MYME Tubeの楽しみ方</h1>
          <span>迷ったら、気になるところからふらっとどうぞ。</span>
        </header>

        <div className="info-content">
          <section>
            <h2>ホーム</h2>
            <p>「今日のmymeランダムガチャ」で、3人から2本ずつ選ばれた動画を楽しめます。「もう一回引く」を押すと、その場で別の組み合わせを抽選します。</p>
          </section>
          <section>
            <h2>メンバー別のタブ</h2>
            <p>それぞれのタブでは、そのメンバーの通常動画とショートを分けて、新しい順に表示します。最初は各8件で、「もっと見る」を押すたびに続きの8件が追加されます。</p>
          </section>
          <section>
            <h2>動画を再生する</h2>
            <p>サムネイルまたは動画タイトルを選ぶと、YouTubeの動画ページが新しいタブで開きます。再生や字幕などの機能は、移動先のYouTubeで利用できます。</p>
          </section>
          <section>
            <h2>動画が見つからないとき</h2>
            <p>掲載データは定期的に更新されます。投稿直後の動画は、反映まで少し時間がかかることがあります。また、販売告知やライブ配信など、一部の動画は表示対象外です。</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
