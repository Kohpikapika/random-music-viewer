<script>
  import { livers } from '../lib/livers.js'

  export let activeTab = 'home'

  const tabs = [
    { id: 'home', label: 'ホーム' },
    { id: 'recommendations', label: '動画' },
    { id: 'shorts', label: 'ショート' },
    ...livers.map((liver) => ({ id: liver.key, label: liver.name, color: liver.color })),
  ]

  function selectTab(tabId) {
    activeTab = tabId
  }
</script>

<section class="channel-shell" aria-labelledby="channel-title">
  <div class="channel-banner">
    <p class="fan-label">UNOFFICIAL FAN SITE</p>
    <strong>3人の音楽を、気ままに巡る。</strong>
    <span>MYME Tube · 繭糸 · みちとせ · それ故</span>
  </div>

  <div class="channel-info">
    <div class="channel-avatar" aria-hidden="true">M</div>
    <div class="channel-copy">
      <h1 id="channel-title">MYME Tube <small>非公式ファンサイト</small></h1>
      <p class="channel-description">3人の声と音楽が重なる場所。今日はどの曲に出会えるでしょう。</p>
      <div class="member-list" aria-label="mymeメンバー">
        {#each livers as liver}
          <span style={`--member-color: ${liver.color}; --member-tint: ${liver.tint}`}>
            <i aria-hidden="true">{liver.initial}</i>{liver.name}
          </span>
        {/each}
      </div>
    </div>
  </div>

  <nav class="channel-nav" aria-label="動画表示メニュー">
    {#each tabs as tab}
      <button
        type="button"
        class:active={activeTab === tab.id}
        class:member-tab={Boolean(tab.color)}
        style={tab.color ? `--tab-color: ${tab.color}` : undefined}
        aria-current={activeTab === tab.id ? 'page' : undefined}
        on:click={() => selectTab(tab.id)}
      >{tab.label}</button>
    {/each}
  </nav>
</section>
