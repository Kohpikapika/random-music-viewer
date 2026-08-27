<script>
  import SiteFooter from '../../components/SiteFooter.svelte'
  import SiteHeader from '../../components/SiteHeader.svelte'
</script>

<svelte:head>
  <title>このサイトについて・利用規約 | MYME Tube</title>
  <meta
    name="description"
    content="MYME Tubeの運営方針、掲載情報、著作権、外部リンク、免責事項についてご案内します。"
  />
</svelte:head>

<SiteHeader />
<main class="info-page">
  <header class="info-hero">
    <p>ABOUT THIS SITE</p>
    <h1>このサイトについて・利用規約</h1>
    <span>気持ちよく楽しむために、知っておいてほしいこと。</span>
  </header>

  <div class="info-content">
    <section>
      <h2>非公式ファンサイトです</h2>
      <p>MYME Tubeは、VTuberユニット「MYME」の音楽に気軽に出会うために個人が制作・運営している非公式ファンサイトです。MYMEおよび各メンバー、所属先、YouTubeとは関係ありません。</p>
    </section>

    <section>
      <h2>掲載している情報について</h2>
      <p>動画タイトル、サムネイル、公開日などはYouTube上で公開されている情報をもとに表示しています。データは定期的に更新していますが、最新性や完全性を保証するものではありません。</p>
    </section>

    <section>
      <h2>動画と外部リンクについて</h2>
      <p>動画を選ぶとYouTubeへ移動します。移動先での閲覧やサービス利用には、YouTubeを含む各サービスの規約とプライバシーポリシーが適用されます。</p>
    </section>

    <section>
      <h2>著作権・権利について</h2>
      <p>動画、サムネイル、名称などに関する権利は、それぞれの権利者に帰属します。本サイトは権利を侵害することを目的としていません。掲載内容に問題がある場合は、下記の連絡先からお知らせください。</p>
    </section>

    <section>
      <h2>免責事項</h2>
      <p>本サイトの利用によって生じた損害や不利益について、運営者は責任を負いかねます。また、予告なく内容の変更、公開の一時停止または終了を行う場合があります。</p>
    </section>

    <section>
      <h2>お問い合わせ</h2>
      <p>不具合、掲載内容、権利に関するご連絡は、運営者の<a href="https://x.com/pika_no_koh" target="_blank" rel="noreferrer">Xアカウント（@pika_no_koh）</a>からお願いします。</p>
    </section>
  </div>
</main>
<SiteFooter />
