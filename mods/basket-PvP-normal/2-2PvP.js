// Button

const buttonImageUrl = getImageURL("play-button.png")

function addButton() {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "add-button",
      image: buttonImageUrl,
    },
    "*"
  )
}

window.onload = addButton

// Values

let playerLeftIds = [1, 2]
let playerRightIds = [3, 4]
let playerAllIds = [1, 2, 3, 4]

let jumpingEnabled = true

let arrowUpPressed = false
let keyWPressed = false

let scoreLeft = 0
let scoreRight = 0

let doublePoint = false

// Media

let normalBallAnimation = [
  "media/ball/normal-1.png",
  "media/ball/normal-2.png",
  "media/ball/normal-3.png",
  "media/ball/normal-4.png",
  "media/ball/normal-5.png",
  "media/ball/normal-6.png",
]

let doubleBallAnimation = [
  "media/ball/2point-1.png",
  "media/ball/2point-2.png",
  "media/ball/2point-3.png",
  "media/ball/2point-4.png",
  "media/ball/2point-5.png",
  "media/ball/2point-6.png",
  "media/ball/2point-7.png",
  "media/ball/2point-8.png",
  "media/ball/2point-9.png",
  "media/ball/2point-10.png",
  "media/ball/2point-11.png",
  "media/ball/2point-12.png",
  "media/ball/2point-13.png",
  "media/ball/2point-14.png",
]

let lightBallAnimation = [
  "media/ball/light-1.png",
  "media/ball/light-2.png",
  "media/ball/light-3.png",
  "media/ball/light-4.png",
  "media/ball/light-5.png",
  "media/ball/light-6.png",
]

let bodyTextures = [
  "media/body/right-1.png",
  "media/body/right-2.png",
  "media/body/right-3.png",
  "media/body/right-4.png",
  "media/body/right-5.png",
]

let normalArmTextures = [
  "media/arm/right-1.png",
  "media/arm/right-2.png",
  "media/arm/right-3.png",
  "media/arm/right-4.png",
  "media/arm/right-5.png",
]

let shortArmTextures = [
  "media/arm/right-short-1.png",
  "media/arm/right-short-2.png",
  "media/arm/right-short-3.png",
  "media/arm/right-short-4.png",
  "media/arm/right-short-5.png",
]

let longArmTextures = [
  "media/arm/right-long-1.png",
  "media/arm/right-long-2.png",
  "media/arm/right-long-3.png",
  "media/arm/right-long-4.png",
  "media/arm/right-long-5.png",
]

let headTextures = [
  "media/head/right-1.png",
  "media/head/right-2.png",
  "media/head/right-3.png",
  "media/head/right-4.png",
  "media/head/right-5.png",
]

let shoeTextures = [
  "media/shoe/right-1.png",
  "media/shoe/right-2.png",
  "media/shoe/right-3.png",
  "media/shoe/right-4.png",
  "media/shoe/right-5.png",
  "media/shoe/right-6.png",
  "media/shoe/right-7.png",
  "media/shoe/right-8.png",
  "media/shoe/right-9.png",
  "media/shoe/right-10.png",
]

let outfitTextures = [
  ["media/tops/formal-1.png", "media/pants/formal-1.png"],
  ["media/tops/formal-2.png", "media/pants/formal-1.png"],
  ["media/tops/normal-1.png", "media/pants/normal-1.png"],
  ["media/tops/normal-2.png", "media/pants/normal-2.png"],
  ["media/tops/normal-3.png", "media/pants/normal-3.png"],
  ["media/tops/normal-4.png", "media/pants/normal-4.png"],
  ["media/tops/normal-5.png", "media/pants/normal-5.png"],
  ["media/tops/normal-6.png", "media/pants/normal-6.png"],
  ["media/tops/normal-7.png", "media/pants/normal-7.png"],
  ["media/tops/normal-8.png", "media/pants/normal-8.png"],
]

let heavyBallAnimation = ["media/ball/heavy-1.png"]

// Random

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomArrayElement(array) {
  return array[getRandomInt(0, array.length - 1)]
}

function getModifiers() {
  let modifierList = []

  const amountPool = [1, 1, 1, 2, 3]

  const amount = getRandomArrayElement(amountPool)

  const kindPool = [
    "ball",
    "ball",
    "ball",
    "hoop",
    "hoop",
    "hoop",
    "head",
    "arm",
    "arm",
    "arm",
    "SNOW",
    "SNOW",
    "BUSINESS",
    "BUSINESS",
    "LARGE HOOP",
    "LARGE HOOP",
  ]

  const ballPool = ["HEAVY BALL", "LIGHT BALL", "DOUBLE POINT"]
  const hoopPool = ["SHORT HOOP", "LONG HOOP"]
  const headPool = ["SMALL HEAD", "BIG HEAD"]
  const armPool = ["SHORT ARM", "LONG ARM"]

  for (let index = 1; index <= amount; index++) {
    let kind = getRandomArrayElement(kindPool)

    if (kind === "ball") {
      modifierList.push(getRandomArrayElement(ballPool))
    } else if (kind === "hoop") {
      modifierList.push(getRandomArrayElement(hoopPool))
    } else if (kind === "head") {
      modifierList.push(getRandomArrayElement(headPool))
    } else if (kind === "arm") {
      modifierList.push(getRandomArrayElement(armPool))
    } else {
      modifierList.push(kind)
    }
  }

  return modifierList
}

// Misc

function getImage(source) {
  let image = new Image()
  image.src = source
  return image
}

function getImageURL(source) {
  return chrome.runtime.getURL(source)
}

// Event functions

window.addEventListener("message", (event) => {
  const action = event.data.action
  if (action === "start") {
    start()
  }
  if (action === "replay") {
    replay()
  }
})

function onMessage(event) {
  const data = event.data
  const action = data.action
  if (action === "propertyChange") {
    properties[data.property] = data.value
  } else if (action === "score") {
    onScore(data.side)
  } else if (action === "playerLand") {
    onPlayerLand(data.playerId)
  } else if (action === "pause") {
    freezeGame()
  } else if (action === "resume") {
    resumeGame()
  } else if (action === "terminate") {
    endGame(true)
  } else if (action === "ballOut") {
    onBallOut(data.side)
  } else if (action === "hoopTouch") {
    onHoopTouch(data.side)
  }
}

function onKeyDown(event) {
  if (jumpingEnabled === false) {
    return
  }

  if (event.code === "ArrowUp") {
    if (arrowUpPressed === true) {
      return
    }
    arrowUpPressed = true
    startJump("right")
  } else if (event.code === "KeyW") {
    if (keyWPressed === true) {
      return
    }
    keyWPressed = true
    startJump("left")
  }
}

function onKeyUp(event) {
  if (event.code === "ArrowUp") {
    stopJump("right")
  } else if (event.code === "KeyW") {
    stopJump("left")
  }
}

function changeHoopTexture(height, width) {
  let textureInfo
  if (height === 0) {
    textureInfo = ["media/hoop-left.png", [0, -4, 40, 368]]
  } else if (height === 2) {
    textureInfo = ["media/hoop-left-long.png", [0, -4, 40, 465]]
  } else if (height === -1.5) {
    textureInfo = ["media/hoop-left-short.png", [0, -4, 40, 290]]
  }
  let textureTopInfo
  let textureBackInfo
  let textureNetInfo
  if (width === 0) {
    textureTopInfo = ["media/hoop-left-top.png", [70, -65, 270, 240]]
    textureBackInfo = ["media/hoop-left-back.png", [150.2, -2, 109.5, 34.5]]
    textureNetInfo = ["media/net-left.png", [0, 0, 26 * 2.8, 18 * 2.8]]
  } else if (width === 0.7) {
    textureTopInfo = ["media/hoop-left-top-large.png", [85, -65, 300, 240]]
    textureBackInfo = [
      "media/hoop-left-back-large.png",
      [164.2, -2, 141.5, 34.5],
    ]
    textureNetInfo = ["media/net-left-large.png", [-5, 0, 38 * 2.8, 18 * 2.8]]
  }

  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/changeTexture",
      name: "hoopLeft",
      textureInfo: textureInfo,
    },
    "*"
  )
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/changeTexture",
      name: "hoopRight",
      textureInfo: textureInfo,
    },
    "*"
  )
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/changeTexture",
      name: "hoopLeftTop",
      textureInfo: textureTopInfo,
    },
    "*"
  )
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/changeTexture",
      name: "hoopRightTop",
      textureInfo: textureTopInfo,
    },
    "*"
  )
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/changeTexture",
      name: "hoopLeftBack",
      textureInfo: textureBackInfo,
    },
    "*"
  )
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/changeTexture",
      name: "hoopRightBack",
      textureInfo: textureBackInfo,
    },
    "*"
  )
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/changeTexture",
      name: "hoopLeftNet",
      textureInfo: textureNetInfo,
    },
    "*"
  )
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/changeTexture",
      name: "hoopRightNet",
      textureInfo: textureNetInfo,
    },
    "*"
  )
}

// Game

function clearGame() {
  killAllBalls()
  killAllPlayers()
}

function start() {
  // Connect events to functions

  window.addEventListener("message", onMessage)
  document.addEventListener("keydown", onKeyDown)
  document.addEventListener("keyup", onKeyUp)

  scoreLeft = 0
  scoreRight = 0
  displayScoreBoards(true)
  startGame(true)
}

function endGame(force) {
  window.removeEventListener("message", onMessage)
  document.removeEventListener("keydown", onKeyDown)
  document.removeEventListener("keyup", onKeyUp)

  console.log(2)

  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "end-game",
      force: force,
    },
    "*"
  )
}

function startGame(first = false) {
  changeProperty("score", false)
  changeProperty("speed", 1 / 60)

  doublePoint = false
  jumpingEnabled = true
  

  // spawnHoops(0,0)

  // Modifiers

  let ballKind = "normal"
  let armSize = "normal"
  let snow = false
  let hoopHeight = 0
  let hoopWidth = 0
  let headSize = "normal"

  let modifiers

  if (first === true) {
    modifiers = {}
  } else {
    modifiers = getModifiers()
  }

  let message = ""

  for (let index in modifiers) {
    let modifer = modifiers[index]
    if (index == modifiers.length - 1) {
      message += modifer
    } else {
      message = message + modifer + " + "
    }

    if (modifer === "DOUBLE POINT") {
      ballKind = "double"
      doublePoint = true
    } else if (modifer === "HEAVY BALL") {
      ballKind = "heavy"
    } else if (modifer === "LIGHT BALL") {
      ballKind = "light"
    }
    if (modifer === "SHORT ARM") {
      armSize = "short"
    } else if (modifer === "LONG ARM") {
      armSize = "long"
    } else if (modifer === "SNOW") {
      snow = true
    } else if (modifer === "SHORT HOOP") {
      hoopHeight = -1.5
    } else if (modifer === "LONG HOOP") {
      hoopHeight = 2
    } else if (modifer === "LARGE HOOP") {
      hoopWidth = 0.7
    } else if (modifer === "BIG HEAD") {
      headSize = "big"
    } else if (modifer === "SMALL HEAD") {
      headSize = "small"
    }
  }

  displayMessage(message)

  // Map

  // snow = true // TESTING

  if (snow === true) {
    changeMap("snow")
  } else {
    changeMap(
      getRandomArrayElement([
        "city1",
        "city1",
        "city1",
        "city1",
        "city2",
        "city2",
        "city2",
        "city3",
        "city3",
        "city3",
      ])
    )
  }

  // hoopWidth = 0.7 // TESTING

  spawnHoops(hoopHeight, hoopWidth)
  changeHoopTexture(hoopHeight, hoopWidth)

  let menuCover = document.querySelector("#menu-cover")

  changeProperty("speed", 0)

  setTimeout(() => {
    spawnBall(0, 10, 1, 0.6, ballKind)

    let outfitIndex1 = getRandomInt(2, 9)
    let outfitIndex2 = getRandomInt(2, 9)

    spawnPlayer("right", 8.1, 0, 4, armSize, headSize, outfitIndex1, snow)
    spawnPlayer("right", 3.5, 0, 3, armSize, headSize, outfitIndex1, snow)

    spawnPlayer("left", -8.1, 0, 1, armSize, headSize, outfitIndex2, snow)
    spawnPlayer("left", -3.5, 0, 2, armSize, headSize, outfitIndex2, snow)

    for (let index in playerAllIds) {
      let id = playerAllIds[index]
      let offset = getRandomInt(-100, 100)
      const currentBalanceAngle = offset / 2000

      setTimeout(() => {
        changeProperty("balanceAngle", [id, currentBalanceAngle])
      }, 1000)
    }

    setTimeout(() => {
      changeProperty("speed", 1 / 60)
    }, 400)

    setTimeout(() => {
      let range = [380, 400]
      if (snow === true) {
        range = [500, 550]
      }
      rotatePlayer([1], getRandomInt(-range[1], -range[0]))
      rotatePlayer([2], getRandomInt(-range[1], -range[0]))
      rotatePlayer([3], getRandomInt(range[0], range[1]))
      rotatePlayer([4], getRandomInt(range[0], range[1]))

      togglePause(true)
    }, 500)
  }, 100)
}

// Jumping functions

function startJump(side) {
  let ids
  if (side === "right") {
    ids = playerRightIds
  } else if (side === "left") {
    ids = playerLeftIds
  }

  for (let index in ids) {
    let id = ids[index]
    let offset = getRandomInt(-100, 100)
    const balanceAngle = offset / 2000
    let xOffset = -properties["playerAngleList"][3]
    xOffset = Math.max(-2, xOffset)
    xOffset = Math.min(2, xOffset)

    let ballPickedUpPlayer = properties["ballPickedUpPlayerList"][1]

    if (
      !ballPickedUpPlayer ||
      parseInt(ballPickedUpPlayer) === id ||
      ids.includes(parseInt(ballPickedUpPlayer)) === false
    ) {
      window.postMessage(
        {
          source: "basket-PvP-normal-mod",
          action: "engine/startJump",
          power: 16,
          xOffset: xOffset,
          rotation: 0,
          ids: [id],
        },
        "*"
      )

      raiseArm([id], true)
    }

    window.postMessage(
      {
        source: "basket-PvP-normal-mod",
        action: "engine/changeProperty",
        property: "balanceAngle",
        value: [id, balanceAngle],
      },
      "*"
    )
  }

  startCharging()
}

function raiseArm(ids, value) {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/raiseArm",
      ids: ids,
      value: value,
    },
    "*"
  )
}

function rotateBall(id, value) {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/rotateBall",
      id: id,
      value: value,
    },
    "*"
  )
}

function stopJump(side) {
  let ids
  let target
  let rotation
  if (side === "right") {
    arrowUpPressed = false
    ids = playerRightIds
    target = properties["targetLeftPosition"]
    console.log(target)
    rotation = 10
  } else if (side === "left") {
    keyWPressed = false
    ids = playerLeftIds
    target = properties["targetRightPosition"]
    console.log(target)
    rotation = -10
  }

  let ballPickedUpPlayer = properties["ballPickedUpPlayerList"][1]

  if (ids.includes(parseInt(ballPickedUpPlayer))) {
    rotateBall(1, rotation)
  }

  let xOffset = getRandomInt(-80, 80) / 50

  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/stopJump",
      ids: ids,
    },
    "*"
  )

  throwBall(ids, target, xOffset, chargeValue / 100)

  stopCharging()
  resetCharging()
  raiseArm(ids, false)
}

// Throw amount

let chargeValue = 0
let chargeInterval = null
let chargeStartTime = null
const chargeDuration = 300
const chargeMax = 100

function startCharging() {
  if (chargeInterval !== null) return

  chargeStartTime = Date.now()
  chargeInterval = setInterval(() => {
    const elapsed = Date.now() - chargeStartTime
    chargeValue = Math.min((elapsed / chargeDuration) * chargeMax, chargeMax)

    if (chargeValue >= chargeMax) {
      stopCharging()
    }
  }, 10)
}

function stopCharging() {
  if (chargeInterval !== null) {
    clearInterval(chargeInterval)
    chargeInterval = null
  }
}

function resetCharging() {
  stopCharging()
  chargeValue = 0
}

// Player

function spawnPlayer(side, x, y, id, armSize, headSize, outfitIndex, snow) {
  // headSize = "small" // TESTING
  
  let skinColor = getRandomInt(0, 4)
  let armOffsetInfo = [0, 0, 0.5 * 59, 0.5 * 238]

  let feetFriction = 2
  if (snow === true) {
    feetFriction = 0.1
  }

  let armRightImage = normalArmTextures[skinColor]
  if (armSize === "short") {
    armOffsetInfo = [0, 0, 0.2 * 150, 0.2 * 480]
    armRightImage = shortArmTextures[skinColor]
  } else if (armSize === "long") {
    armOffsetInfo = [0, 0, 0.15 * 200, 0.15 * 960]
    armRightImage = longArmTextures[skinColor]
  }

  let headRightImage = headTextures[skinColor]
  let headRightImageInfo = [-3, 10, 0.28 * 179, 0.28 * 241]
  let headLowerAngle = -0.25

  let bodyRightImage = bodyTextures[skinColor]

  let shoeTexture = shoeTextures[0]

  let [topTexture, pantsTexture] = outfitTextures[outfitIndex]

  if (headSize === "normal") {
    headSize = [0.35, 0.4]
  } else if (headSize === "small") {
    headRightImageInfo = [3, 10, 0.2 * 179, 0.2 * 241]
    headSize = [0.3, 0.15]
  } else if (headSize === "big") {
    headSize = [0.6, 0.7]
    headLowerAngle = -0.1
    headRightImageInfo = [-10, 5, 0.42 * 179, 0.42 * 241]
  }

  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/spawnPlayer",
      side: side,
      x: x,
      y: y,
      id: id,
      team: 2,
      armSize: armSize,
      headSize: headSize,
      headLowerAngle: headLowerAngle,
      feetFriction: feetFriction,
      armAttachedTextures: [[armRightImage, armOffsetInfo]],
      headAttachedTextures: [
        [headRightImage, headRightImageInfo],
      ],
      bodyAttachedTextures: [
        [bodyRightImage, [-5, 10, 0.45 * 127, 0.45 * 394]],
        [shoeTexture, [-5.5, 72.5, 0.1 * 480, 0.1 * 420]],
        [topTexture, [0.2, -41, 0.095 * 360, 0.095 * 660]],
        [pantsTexture, [0.2, 10, 0.095 * 3 * 120, 0.095 * 3 * 140]],
      ],
    },
    "*"
  )
}

function rotatePlayer(ids, value) {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/rotatePlayer",
      ids: ids,
      value: value,
    },
    "*"
  )
}

function wigglePlayer(id) {
  setTimeout(() => {
    rotatePlayer(
      [parseInt(id)],
      getRandomArrayElement([-300, -250, -200, 200, 250, 300])
    )
  }, 100)
}

function killAllPlayers() {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/killAllPlayers",
    },
    "*"
  )
}

// Ball

function spawnBall(x, y, id, size, kind) {
  let frameList = normalBallAnimation
  let bounciness = 0.6
  let density = 0.01

  if (kind === "double") {
    frameList = doubleBallAnimation
  } else if (kind === "heavy") {
    bounciness = 0
    density = 0.05
    frameList = heavyBallAnimation
  } else if (kind === "light") {
    bounciness = 0.9
    frameList = lightBallAnimation
  }

  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/spawnBall",
      x: x,
      y: y,
      id: id,
      size: size,
      frameList: frameList,
      bounciness: bounciness,
      density: density,
    },
    "*"
  )
}

function throwBall(ids, targetPosition, targetXOffset, throttle) {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/throwBall",
      ids: ids,
      targetPosition: targetPosition,
      targetXOffset: targetXOffset,
      throttle: throttle,
    },
    "*"
  )
}

function killAllBalls() {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/killAllBalls",
    },
    "*"
  )
}

function changeProperty(property, value) {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/changeProperty",
      property: property,
      value: value,
    },
    "*"
  )
}

function displayMessage(message) {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "graphics/displayMessage",
      message: message,
    },
    "*"
  )
}

function displayScoreBoards(value) {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "graphics/displayScoreBoards",
      value: value,
    },
    "*"
  )
}

function changeMap(map) {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "graphics/changeMap",
      map: map,
    },
    "*"
  )
}

// Other

function onPlayerLand(playerId) {
  wigglePlayer(playerId)
}

function onScore(side) {
  togglePause(false)
  changeProperty("speed", 1 / 300)
  jumpingEnabled = false

  if (side === "left") {
    basketAnimation("media/basket-text-blue.png")
    if (doublePoint === true) {
      scoreRight += 2
    } else {
      scoreRight++
    }
    updateScore("right", scoreRight)
  } else {
    basketAnimation("media/basket-text-red.png")
    if (doublePoint === true) {
      scoreLeft += 2
    } else {
      scoreLeft++
    }
    updateScore("left", scoreLeft)
  }

  if (scoreLeft > 4) {
    setTimeout(() => {
      endGame(false)
      return
    }, 2000)
  } else if (scoreRight > 4) {
    setTimeout(() => {
      endGame(false)
      return
    }, 2000)
  } else {
    setTimeout(() => {
      fadeOut()
    }, 2300)
    setTimeout(() => {
      killAllPlayers()
      killAllBalls()
    }, 2520)
    setTimeout(() => {
      startGame()
    }, 2550)
    setTimeout(() => {
      fadeIn()
    }, 2700)
  }
}

function basketAnimation(image) {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "graphics/basketAnimation",
      image: image,
    },
    "*"
  )
}

function updateScore(side, score) {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "graphics/updateScore",
      side: side,
      score: score,
    },
    "*"
  )
}

function fadeOut() {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "graphics/fadeOut",
    },
    "*"
  )
}

function fadeIn() {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "graphics/fadeIn",
    },
    "*"
  )
}

function togglePause(value) {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "toggle-pause",
      value: value,
    },
    "*"
  )
}

function freezeGame() {
  changeProperty("speed", 0)
}

function resumeGame() {
  changeProperty("speed", 1 / 60)
}

let properties = {}

function replay() {
  console.log("replay")

  fadeOut()

  setTimeout(() => {
    clearGame()
    start()
  }, 250)

  setTimeout(() => {
    fadeIn()
  }, 400)
}

function spawnHoops(height, width) {
  for (side of ["left", "right"]) {
    window.postMessage(
      {
        source: "basket-PvP-normal-mod",
        action: "engine/spawnHoop",
        side: side,
        distance: 14.4,
        height: height,
        width: width,
      },
      "*"
    )
  }
}

function onBallOut() {
  console.log("ball out")

  togglePause(false)
  changeProperty("speed", 1 / 300)
  jumpingEnabled = false

  setTimeout(() => {
    fadeOut()
  }, 2300)
  setTimeout(() => {
    killAllPlayers()
    killAllBalls()
  }, 2520)
  setTimeout(() => {
    startGame()
  }, 2550)
  setTimeout(() => {
    fadeIn()
  }, 2700)
}

function onHoopTouch(side) {
  console.log(1, side)
  if (side === "left") {
    tiltHoop(side, 0.05)
    setTimeout(() => {
      tiltHoop(side, 0)
    }, 200)
  } else if (side === "right") {
    tiltHoop(side, -0.05)
    setTimeout(() => {
      tiltHoop(side, 0)
    }, 200)
  }
}

function tiltHoop(side, angle) {
  window.postMessage(
    {
      source: "basket-PvP-normal-mod",
      action: "engine/tiltHoop",
      side: side,
      angle: angle,
    },
    "*"
  )
}