const WIDTH = 1200
const HEIGHT = 675
const COLORS = ['#f28c28', '#36a269', '#37a9d6']

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.fill()
}

function drawWrappedTitle(context, title, x, y, maxWidth) {
  const characters = [...title]
  const lines = ['']

  for (const character of characters) {
    const currentLine = lines.at(-1)
    const nextLine = `${currentLine}${character}`

    if (context.measureText(nextLine).width > maxWidth && currentLine) {
      if (lines.length === 2) {
        lines[1] = `${lines[1].slice(0, -1)}…`
        break
      }
      lines.push(character)
    } else {
      lines[lines.length - 1] = nextLine
    }
  }

  lines.forEach((line, index) => context.fillText(line, x, y + index * 30))
}

function drawGroupMark(context, x, y, radius) {
  COLORS.forEach((color, index) => {
    context.beginPath()
    context.moveTo(x, y)
    context.arc(x, y, radius, -Math.PI / 2 + index * Math.PI * 2 / 3, -Math.PI / 2 + (index + 1) * Math.PI * 2 / 3)
    context.closePath()
    context.fillStyle = color
    context.fill()
  })
}

function setFittedHeadingFont(context, title) {
  let size = 52

  do {
    context.font = `900 ${size}px "Yu Gothic", sans-serif`
    size -= 2
  } while (context.measureText(title).width > 1072 && size >= 30)
}

export async function createPickImageBlob(picks, title) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext('2d')

  const background = context.createLinearGradient(0, 0, WIDTH, HEIGHT)
  background.addColorStop(0, '#fff5e9')
  background.addColorStop(.5, '#f2faf5')
  background.addColorStop(1, '#edf9fd')
  context.fillStyle = background
  context.fillRect(0, 0, WIDTH, HEIGHT)

  const barHeights = [40, 58, 48]
  COLORS.forEach((color, index) => {
    context.fillStyle = color
    roundedRect(context, 64 + index * 28, 102 - barHeights[index], 18, barHeights[index], 9)
  })

  context.fillStyle = '#656565'
  context.font = '800 18px "Yu Gothic", sans-serif'
  context.letterSpacing = '3px'
  context.fillText('MYME 3 PICKS', 174, 80)
  context.letterSpacing = '0px'
  context.fillStyle = '#111'
  setFittedHeadingFont(context, title)
  context.fillText(title, 64, 156)
  context.fillStyle = '#666'
  context.font = '500 20px "Yu Gothic", sans-serif'
  context.fillText('わたしが選んだ、いま聴いてほしい3曲。', 68, 190)

  picks.forEach((pick, index) => {
    const y = 220 + index * 122
    context.fillStyle = 'rgba(255,255,255,.88)'
    roundedRect(context, 64, y, 1072, 104, 22)
    context.fillStyle = pick.channel.color
    context.beginPath()
    context.arc(120, y + 52, 31, 0, Math.PI * 2)
    context.fill()
    if (pick.channel.isGroup) drawGroupMark(context, 120, y + 52, 31)
    context.fillStyle = '#fff'
    context.font = '900 26px "Yu Gothic", sans-serif'
    context.textAlign = 'center'
    context.fillText(String(index + 1), 120, y + 61)
    context.textAlign = 'left'
    context.fillStyle = '#777'
    context.font = '800 17px "Yu Gothic", sans-serif'
    context.fillText(pick.channel.name, 174, y + 28)
    context.fillStyle = '#111'
    context.font = '800 26px "Yu Gothic", sans-serif'
    drawWrappedTitle(context, pick.displayTitle ?? pick.video.title, 174, y + 59, 910)
  })

  context.fillStyle = '#111'
  context.font = '900 22px "Yu Gothic", sans-serif'
  context.fillText('MYME Tube', 66, 632)
  context.fillStyle = '#777'
  context.font = '700 13px "Yu Gothic", sans-serif'
  context.fillText('UNOFFICIAL FAN SITE', 207, 631)
  context.textAlign = 'right'
  context.fillStyle = '#111'
  context.font = '800 18px "Yu Gothic", sans-serif'
  context.fillText('#myme', 1134, 632)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('画像を生成できませんでした。'))
    }, 'image/png')
  })
}
