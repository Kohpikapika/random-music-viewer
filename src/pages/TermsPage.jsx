import { useEffect } from 'react'
import SiteFooter from '../components/SiteFooter.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

export default function TermsPage() {
  useEffect(() => {
    document.title = 'このサイトについて・利用規約 | MYME Tube'
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        'MYME Tubeの運営方針、配信での紹介、掲載情報、著作権、外部リンク、免責事項についてご案内します。',
      )
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="info-page">
        <header className="info-hero">
          <p>ABOUT THIS SITE</p>
          <h1>このサイトについて・利用規約</h1>
          <span>気持ちよく楽しむために、知っておいてほしいこと。</span>
        </header>

        <div className="info-content">
          <section>
            <h2>非公式ファンサイトです</h2>
            <p>MYME Tubeは、VTuberユニット「myme」の音楽に気軽に出会うために個人が制作・運営している非公式ファンサイトです。mymeおよび各メンバー、所属先、YouTubeとは関係ありません。</p>
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
            <h2>配信・動画での利用について</h2>
            <p>本サイトの画面は、配信・動画・SNS投稿などでご紹介いただいて構いません。事前の連絡は不要です。ただし、本サイトに掲載している動画・楽曲・サムネイルなどの権利は、それぞれの権利者に帰属します。本サイトの利用許可は、これらのコンテンツの利用許諾を意味するものではありません。配信内で動画や楽曲を再生・利用する場合は、myme各メンバー、楽曲制作者、その他の権利者および利用する配信プラットフォームのガイドライン・規約をご確認ください。</p>
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
            <p>
              不具合、掲載内容、権利に関するご連絡は、運営者の
              <a href="https://x.com/pika_no_koh" target="_blank" rel="noreferrer">
                Xアカウント（@pika_no_koh）
              </a>
              からお願いします。
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
