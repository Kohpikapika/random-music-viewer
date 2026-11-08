export default function PickProgress({ count, onShowPreview }) {
  return (
    <aside className="pick-progress" aria-label={`MYME 3 PICKS ${count}/3曲選択中`}>
      <div><span>MYME 3 PICKS</span><strong>{count}/3曲 選択中</strong></div>
      <button type="button" onClick={onShowPreview}>プレビューを見る</button>
    </aside>
  )
}
