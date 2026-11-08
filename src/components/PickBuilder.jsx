import PickPreview from './PickPreview.jsx'

export default function PickBuilder({
  active,
  picks,
  title,
  notice,
  onStart,
  onCancel,
  onClear,
  onCopy,
  onDownload,
  onPickTitleChange,
  onRandomize,
  onRemove,
  onShare,
  onTitleChange,
}) {
  if (!active) {
    return (
      <section className="pick-entry content-section" aria-labelledby="pick-entry-title">
        <div>
          <p className="eyebrow">MAKE YOUR PICKS</p>
          <h2 id="pick-entry-title">お気に入りのmyme 3曲を選ぼう</h2>
          <p>好きな3曲を選んで、Xに貼れる1枚の画像をつくれます。</p>
        </div>
        <div className="pick-entry-actions">
          <button type="button" onClick={onStart}>自分で3曲を選ぶ</button>
          <button type="button" className="secondary" onClick={onRandomize}>
            3曲をランダムで選ぶ
          </button>
        </div>
      </section>
    )
  }

  const isComplete = picks.length === 3

  return (
    <section className="pick-builder content-section" id="pick-builder" aria-labelledby="pick-builder-title">
      <div className="pick-builder-guide">
        <p className="eyebrow">MYME 3 PICKS MAKER</p>
        <h2 id="pick-builder-title">お気に入りの3曲を画像にしよう</h2>
        <ol className="pick-steps" aria-label="画像を作る手順">
          <li className="current"><b>1</b><span>曲を選ぶ<small>動画カードから選ぶか、3曲をランダム抽選します</small></span></li>
          <li className={picks.length ? 'current' : ''}><b>2</b><span>文字を整える<small>完成イメージ上で直接編集できます</small></span></li>
          <li className={isComplete ? 'current' : ''}><b>3</b><span>保存・共有<small>3曲揃うとボタンが使えます</small></span></li>
        </ol>
        <div className="pick-count" aria-live="polite">
          <strong>{picks.length}<span>/3曲</span></strong>
          <p>{isComplete ? '画像が完成しました！' : `あと${3 - picks.length}曲選んでください。`}</p>
        </div>
        <button type="button" className="pick-randomize" onClick={onRandomize}>
          <span aria-hidden="true">↻</span> 3曲をランダムで選ぶ
        </button>
        <div className="pick-builder-actions">
          <button type="button" className="pick-download" disabled={!isComplete} onClick={onDownload}>画像を保存</button>
          <button type="button" className="pick-x-share" disabled={!isComplete} onClick={onShare}>X投稿画面を開く</button>
          <button type="button" className="pick-copy" disabled={!isComplete} onClick={onCopy}>共有URLをコピー</button>
        </div>
        {isComplete && <p className="pick-attach-help">保存した画像を、開いたXの投稿画面で添付してください。</p>}
        {notice && <p className="pick-builder-notice" role="status">{notice}</p>}
        <div className="pick-builder-subactions">
          <button type="button" onClick={onClear}>選び直す</button>
          <button type="button" onClick={onCancel}>選ぶのをやめる</button>
        </div>
      </div>
      <div className="pick-preview-wrap">
        <p>完成イメージ <span>文字を押すと直接編集できます</span></p>
        <PickPreview
          picks={picks}
          title={title}
          onPickTitleChange={onPickTitleChange}
          onRemove={onRemove}
          onTitleChange={onTitleChange}
        />
      </div>
    </section>
  )
}
