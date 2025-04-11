/*
 * Project: NyaaWidget
 * Author: DxC
 * Image Source: "https://docs.nekos.best/""
 *
 * What it does
 * - shows cat-girl pics
 * - works in small, medium and big
 * - tapping opens the image in Safari
 *
 * What it doesn't (yet)
 * - properly align content 💀
 */

let nekoData = await loadNeko()
let nekoUrl = nekoData.url
let authorName = nekoData.artist_name || "Unknown" // Se il nome dell'autore non esiste, usa "Sconosciuto"
let artistHref = nekoData.artist_href

let widget = null
if (config.runsInWidget) {
  if (config.widgetFamily == "small") {
    widget = await createSmallWidgetNeko(nekoUrl)
  } else if (config.widgetFamily == "medium") {
  widget = await createMediumWidgetNeko(nekoUrl, authorName, artistHref)
  } else if (config.widgetFamily == "large") {
    widget = await createLargeWidgetNeko(nekoUrl, authorName)
  }
  Script.setWidget(widget)
  Script.complete()
} else if (config.runsWithSiri) {
  let widget = await createMediumWidgetNeko(nekoUrl, authorName)
  await widget.presentMedium()
  Script.complete()
} else {
  await presentMenu(nekoUrl)
}

async function presentMenu(nekoUrl) {
  let alert = new Alert()
  alert.title = "❤ NyaaWidget ❤"
  alert.message = "Catgirls everywhere!"
  alert.addAction("View Small Widget")
  alert.addAction("View Medium Widget")
  alert.addAction("View Large Widget")
  alert.addAction("Show me an example (Open in Safari)")
  alert.addCancelAction("Cancel")
  let idx = await alert.presentSheet()
  if (idx == 0) {
    let widget = await createSmallWidgetNeko(nekoUrl)
    await widget.presentSmall()
  } else if (idx == 1) {
    let widget = await createMediumWidgetNeko(nekoUrl, authorName)
    await widget.presentMedium()
  } else if (idx == 2) {
    let widget = await createLargeWidgetNeko(nekoUrl, authorName)
    await widget.presentLarge()
  } else if (idx == 3) {
    Safari.open(nekoUrl)
  }
}

async function loadNeko() {
  let url = "https://nekos.best/api/v2/neko"
  let req = new Request(url)
  let json = await req.loadJSON()
  return json.results[0] || {} // Se la risposta non è valida, restituisci un oggetto vuoto
}

// SMALL WIDGET
async function createSmallWidgetNeko(nekoUrl) {
  let w = new ListWidget()
  w.backgroundColor = new Color("#ffffff")
  w.url = nekoUrl
  w.refreshAfterDate = new Date(Date.now() + 1000 * 60 * 60) // ogni 1 ora

  let img = await loadImage(nekoUrl)
  let nekoImg = w.addImage(img)
  nekoImg.resizable = true
  nekoImg.imageSize = new Size(400, 130)
  nekoImg.centerAlignImage()
  nekoImg.cornerRadius = 0

  return w
}

// MEDIUM WIDGET (Aspect Ratio 16:9)
async function createMediumWidgetNeko(nekoUrl, authorName, artistHref) {
  let w = new ListWidget()
  w.backgroundColor = new Color("#ffffff")
  w.url = artistHref
  w.refreshAfterDate = new Date(Date.now() + 1000 * 60 * 60) // Ogni 1 ora

  let hstack = w.addStack()
  hstack.layoutHorizontally()
  hstack.centerAlignContent()

  let img = await loadImage(nekoUrl)
  let nekoImg = hstack.addImage(img)
  nekoImg.imageSize = new Size(120, 120)
  nekoImg.cornerRadius = 12
  nekoImg.resizable = true
  nekoImg.leftAlignImage()

  nekoImg.url = nekoUrl

  hstack.addSpacer(12)

  let vstack = hstack.addStack()
  vstack.layoutVertically()
  vstack.centerAlignContent()

  let author = vstack.addText("by " + authorName)
  author.font = Font.mediumSystemFont(16)
  author.textColor = new Color("#000000")
  author.lineLimit = 1

  vstack.addSpacer(4)

  let sourceLabel = vstack.addText("pixiv.net")
  sourceLabel.font = Font.lightSystemFont(12)
  sourceLabel.textColor = new Color("#555555")

  vstack.url = artistHref

  return w
}

// LARGE WIDGET (Aspect Ratio 4:3 o simile)
async function createLargeWidgetNeko(nekoUrl, authorName) {
  let w = new ListWidget()
  w.backgroundColor = new Color("#ffffff")
  w.url = nekoUrl
  w.refreshAfterDate = new Date(Date.now() + 1000 * 60 * 60) // Ogni 1 ora

  let hstack = w.addStack()
  hstack.layoutHorizontally()
  hstack.centerAlignContent()

  let img = await loadImage(nekoUrl)
  let nekoImg = hstack.addImage(img)
  nekoImg.resizable = true
  nekoImg.imageSize = new Size(250, 300)
  nekoImg.cornerRadius = 0
  nekoImg.position = new Point(0, 0)

  let spacer = w.addSpacer(8)

  let vstack = w.addStack()
  vstack.layoutVertically()
  vstack.centerAlignContent()

  let author = vstack.addText("by " + authorName)
  author.font = Font.mediumSystemFont(12)
  author.textColor = new Color("#000000")
  author.lineLimit = 1

  return w
}

// Funzione per caricare l’immagine
async function loadImage(url) {
  let req = new Request(url)
  return await req.loadImage()
}
