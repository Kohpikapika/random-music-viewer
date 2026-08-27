<script>
  import SiteFooter from '../../components/SiteFooter.svelte'
  import SiteHeader from '../../components/SiteHeader.svelte'
</script>

<svelte:head>
  <title>ヘルプ | MYME Tube</title>
  <meta name="description" content="MYME Tubeのタブ、ランダムガチャ、動画一覧の使い方をご案内します。" />
</svelte:head>

<SiteHeader />
<main class="info-page">
  <header class="info-hero help-hero">
    <p>HELP</p>
    <h1>MYME Tubeの楽しみ方</h1>
    <span>迷ったら、気になるところからふらっとどうぞ。</span>
  </header>

  <div class="info-content">
    <section>
      <h2>ホーム</h2>
      <p>「今日のmymeランダムガチャ」で、3人から2本ずつ選ばれた動画を楽しめます。「もう一回引く」を押すと、その場で別の組み合わせを抽選します。</p>
    </section>

    <section>
      <h2>動画</h2>
      <p>歌ってみたやオリジナル曲などを、3人の動画が順番に並ぶ一覧で見られます。ショート動画はこのタブには含まれません。</p>
    </section>

    <section>
      <h2>ショート</h2>
      <p>タイトルに「#shorts」が付いた動画を、投稿のあるメンバーごとにまとめています。</p>
    </section>

    <section>
      <h2>メンバー別のタブ</h2>
      <p>それぞれのタブでは、そのメンバーの動画をランダムに表示します。「もう一回引く」で、そのメンバーだけを引き直せます。</p>
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
