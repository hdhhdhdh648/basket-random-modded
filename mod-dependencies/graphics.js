const canvasContainer = document.querySelector("#canvas-container")
const mapContainer = document.querySelector("#map-container")

function setMapCity(
  groundTexture,
  bushesTexture,
  fenceTexture,
  cityTexture,
  cloudTexture,
  skyColor
) {
  const canvasHeight = canvasContainer.getBoundingClientRect().height
  const bodyHeight = document.body.getBoundingClientRect().height

  const floor = document.createElement("div")
  floor.style.height =
    (bodyHeight - canvasHeight) / 2 + canvasHeight * 0.42 + "px"
  floor.style.width = "100%"
  floor.style.position = "absolute"
  floor.style.bottom = "0"
  floor.style.zIndex = 1

  floor.style.backgroundImage = 'url("' + groundTexture + '")'
  floor.style.backgroundRepeat = "repeat"
  floor.style.backgroundSize = "10%"

  const border = document.createElement("div")
  border.style.width = "100%"
  border.style.height = (canvasHeight * 1) / 200 + "px"
  border.style.position = "absolute"
  border.style.zIndex = 3
  border.style.backgroundColor = "#2D2D2D"
  border.style.bottom =
    (bodyHeight - canvasHeight) / 2 + canvasHeight * 0.42 + "px"

  const bushes = document.createElement("div")
  bushes.style.width = "100%"
  bushes.style.height = canvasHeight * 0.09 + "px"
  bushes.style.position = "absolute"
  bushes.style.zIndex = 2

  bushes.style.zIndex = 2

  bushes.style.backgroundImage = 'url("' + bushesTexture + '")'
  bushes.style.backgroundRepeat = "repeat"
  bushes.style.backgroundSize = "auto 100%"
  bushes.style.backgroundPosition = "center"

  bushes.style.bottom =
    (bodyHeight - canvasHeight) / 2 + canvasHeight * 0.42 + "px"

  const fence = document.createElement("div")
  fence.style.width = "100%"
  // fence.style.height = "17%"
  fence.style.height = canvasHeight * 0.185 + "px"
  fence.style.position = "absolute"
  // fence.style.bottom = "0"
  fence.style.zIndex = 2

  fence.style.zIndex = 1

  fence.style.backgroundImage = 'url("' + fenceTexture + '")'
  fence.style.backgroundRepeat = "repeat"
  fence.style.backgroundSize = "auto 100%"
  fence.style.backgroundPosition = "center"

  fence.style.bottom =
    (bodyHeight - canvasHeight) / 2 + canvasHeight * 0.42 + "px"

  const city = document.createElement("div")
  city.style.width = "100%"
  city.style.height = canvasHeight * 0.35 + "px"
  city.style.position = "absolute"
  city.style.zIndex = 0

  city.style.zIndex = 0

  city.style.backgroundImage = 'url("' + cityTexture + '")'
  city.style.backgroundRepeat = "repeat"
  city.style.backgroundSize = "95%"

  city.style.bottom =
    (bodyHeight - canvasHeight) / 2 + canvasHeight * 0.58 + "px"
  city.style.backgroundSize = "auto 100%"
  city.style.backgroundPosition = "-100%"

  const clouds = document.createElement("div")
  clouds.style.width = "100%"
  clouds.style.height = canvasHeight * 0.5 + "px"
  clouds.style.position = "absolute"
  clouds.style.zIndex = 0

  clouds.style.zIndex = -1

  clouds.style.backgroundImage = 'url("' + cloudTexture + '")'
  clouds.style.backgroundRepeat = "repeat"
  clouds.style.backgroundSize = "auto 100%"
  clouds.style.backgroundPosition = "-100%"

  clouds.style.transition = " all 3000ms ease-in-out"

  let direction = 1
  const maxOffset = canvasHeight * 0.02

  clouds.style.transform = `translateY(${-maxOffset}px)`

  function moveClouds() {
    const offset = direction === 1 ? 0 : -maxOffset // up and down
    clouds.style.transform = `translateY(${offset}px)`
    direction *= -1
  }
  setTimeout(() => {
    moveClouds()
  }, 1)

  setInterval(() => {
    moveClouds()
  }, 3000)

  clouds.style.bottom =
    (bodyHeight - canvasHeight) / 2 + canvasHeight * 0.5 + "px"

  mapContainer.appendChild(floor)
  mapContainer.appendChild(bushes)
  mapContainer.appendChild(fence)
  mapContainer.appendChild(city)
  mapContainer.appendChild(clouds)
  mapContainer.appendChild(border)

  mapContainer.style.backgroundColor = skyColor
}

function setMap() {
  if (currentMap === "city1") {
    setMapCity(
      "media/ground-texture-1.png",
      "media/bushes-texture.png",
      "media/fence-texture.png",
      "media/city-texture-1.png",
      "media/clouds-texture-1.png",
      "#95EDF4"
    )
  } else if (currentMap === "city2") {
    setMapCity(
      "media/ground-texture-1.png",
      "media/bushes-texture.png",
      "media/fence-texture.png",
      "media/city-texture-2.png",
      "media/clouds-texture-2.png",
      "#FFD69F"
    )
  } else if (currentMap === "city3") {
    setMapCity(
      "media/ground-texture-1.png",
      "media/bushes-texture.png",
      "media/fence-texture.png",
      "media/city-texture-3.png",
      "media/clouds-texture-3.png",
      "#5959C6"
    )
  }
}

function clearMap() {
  console.log("clear")
  mapContainer.innerHTML = ""
}

let currentMap = null

export function changeMap(map) {
  currentMap = map
  clearMap()
  if (map){
setMap()
  }
}

window.onresize = function () {
  clearMap()
  setMap()
}

export function basketAnimation(image) {
  const canvasHeight = canvasContainer.getBoundingClientRect().height
  const bodyHeight = document.body.getBoundingClientRect().height

  console.log("animation")

  const img = document.createElement("img")
  img.style.height = "20%"
  img.style.width = "25%"
  img.style.objectFit = "contain"
  img.style.top = (bodyHeight - canvasHeight) / 2 + canvasHeight * 0.1 + "px"
  img.src = image

  img.classList.add("basketAnimation")
  document.body.appendChild(img)
}

let scoreRightDisplay = null
let scoreLeftDisplay = null

let characterList = {
  0: "numbers/0.png",
  1: "numbers/1.png",
  2: "numbers/2.png",
  3: "numbers/3.png",
  4: "numbers/4.png",
  5: "numbers/5.png",
  6: "numbers/6.png",
  7: "numbers/7.png",
  8: "numbers/8.png",
  9: "numbers/9.png",
}

function changeScore(side, score = "0") {
  let display = null
  let flip = false
  if (side === "left" && scoreLeftDisplay) {
    display = scoreLeftDisplay
  } else if (side === "right" && scoreRightDisplay) {
    display = scoreRightDisplay
    flip = true
  } else {
    return
  }

  display.innerHTML = ""
  for (let index = 0; index < score.length; index++) {
    let character = score[index]
    let source = characterList[character]
    let digitImage = document.createElement("img")
    digitImage.style.height = "55%"
    digitImage.src = source

    if (flip === true) {
      digitImage.style.transform = "scaleX(-1)"
      digitImage.style.order = -index
    }

    display.appendChild(digitImage)
  }
}

export function updateScore(side, score, animation = true, duration = 2000) {
  changeScore(side, score.toString())

  if (!animation) return

  const containers = {
    left: scoreLeftDisplay,
    right: scoreRightDisplay,
  }

  const container = containers[side]
  if (!container) return

  let toggle = false

  const applyStyle = (highlight) => {
    const height = highlight ? "65%" : "55%"
    const filter = highlight ? "sepia(1) saturate(15) hue-rotate(-40deg)" : ""
    for (const number of container.children) {
      number.style.height = height
      number.style.filter = filter
    }
  }

  applyStyle(false)

  const intervalId = setInterval(() => {
    toggle = !toggle
    applyStyle(toggle)
  }, 300)

  setTimeout(() => {
    clearInterval(intervalId)
    applyStyle(false)
  }, duration)
}

let scoreBoards = []

export function displayScoreBoards(
  value,
  scoreLeft = "0",
  scoreRight = "0",
  leftImage = "media/score-red.png",
  rightImage = "media/score-blue.png"
) {
  if (value === true) {
    const scoreBoardLeft = document.createElement("div")
    scoreBoardLeft.style.position = "absolute"
    scoreBoardLeft.style.bottom = "1vw"
    scoreBoardLeft.style.width = "14vw"
    scoreBoardLeft.style.aspectRatio = "196 / 88"
    scoreBoardLeft.style.backgroundSize = "cover"
    scoreBoardLeft.style.backgroundImage = `url(${leftImage})`
    scoreBoardLeft.style.left = "-4vw"
    scoreBoardLeft.style.zIndex = "106"
    scoreBoardLeft.classList.add("score")

    const scoreBoardRight = scoreBoardLeft.cloneNode(true)
    scoreBoardRight.style.backgroundImage = `url(${rightImage})`
    scoreBoardRight.style.right = "-4vw"
    scoreBoardRight.style.left = ""
    scoreBoardRight.style.transform = "scaleX(-1)"

    document.body.appendChild(scoreBoardLeft)
    document.body.appendChild(scoreBoardRight)

    const scoreBoardLeftContainer = document.createElement("div")
    const scoreBoardRightContainer = document.createElement("div")

    const containerStyles = {
      width: "10vw",
      height: "98%",
      paddingLeft: "3.8vw",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "5px",
    }

    Object.assign(scoreBoardLeftContainer.style, containerStyles)
    Object.assign(scoreBoardRightContainer.style, containerStyles)

    scoreBoardLeft.appendChild(scoreBoardLeftContainer)
    scoreBoardRight.appendChild(scoreBoardRightContainer)

    scoreLeftDisplay = scoreBoardLeftContainer
    scoreRightDisplay = scoreBoardRightContainer

    changeScore("left", scoreRight)
    changeScore("right", scoreLeft)

    scoreBoards.push(scoreBoardLeft, scoreBoardRight)
  } else if (value === false) {
    for (let board of scoreBoards) {
      board.remove()
      scoreLeftDisplay = null
      scoreRightDisplay = null
    }
  }
}

const fade = document.createElement("div")

const fadeStyles = {
  height: "100%",
  width: "100%",
  position: "absolute",
  zIndex: 110,
  backgroundColor: "#000000",
  transition: "all 200ms",
  opacity: 0,
}

Object.assign(fade.style, fadeStyles)

document.body.appendChild(fade)

export function fadeOut() {
  console.log("fading out")
  fade.style.opacity = 1
}

export function fadeIn() {
  fade.style.opacity = 0
}

export function displayMessage(message) {
  console.log(message)

  const container = document.createElement("div")
  container.style.display = "flex"
  container.style.position = "absolute"
  container.style.justifyContent = "center"
  container.style.justifyItems = "center"
  container.style.top = "2vw"
  container.style.width = "80vw"
  container.style.height = "3vw"
  container.style.transition = "top 300ms cubic-bezier(0.42, -0.37, 0.71, 0.25);"

  document.body.appendChild(container)

  for (let index = 0; index < message.length; index++) {
    let character = message[index]
    let image = document.createElement("img")
    image.src = "font/" + character + ".png"
    image.style.height = 100%

    container.appendChild(image)
  }

  setTimeout(() => {
    container.style.top = "-5vw"
  }, 1000);

  setTimeout(() => {
    container.remove()
  }, 1500);
}
