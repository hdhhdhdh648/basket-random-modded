// Imports

import { GameEngine, startEngine } from "../game-engine.js"
import {
  changeMap,
  basketAnimation,
  displayScoreBoards,
  fadeIn,
  fadeOut,
  updateScore,
  displayMessage,
} from "../mod-dependencies/graphics.js"
import { endGame } from "../src/menu.js"

// Values

let playerLeftIds = [1, 2]
let playerRightIds = [3, 4]
let playerAllIds = [1, 2, 3, 4]

let jumpingEnabled = true

let arrowUpPressed = false
let keyWPressed = false

let scoreLeft = 0
let scoreRight = 0

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
  const hoopPool = ["SHORT HOOP", "TALL HOOP"]
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

// Media

let normalBallAnimation = [
  getImage("media/ball/normal-1.png"),
  getImage("media/ball/normal-2.png"),
  getImage("media/ball/normal-3.png"),
  getImage("media/ball/normal-4.png"),
  getImage("media/ball/normal-5.png"),
  getImage("media/ball/normal-6.png"),
]

let doubleBallAnimation = [
  getImage("media/ball/2point-1.png"),
  getImage("media/ball/2point-2.png"),
  getImage("media/ball/2point-3.png"),
  getImage("media/ball/2point-4.png"),
  getImage("media/ball/2point-5.png"),
  getImage("media/ball/2point-6.png"),
  getImage("media/ball/2point-7.png"),
  getImage("media/ball/2point-8.png"),
  getImage("media/ball/2point-9.png"),
  getImage("media/ball/2point-10.png"),
  getImage("media/ball/2point-11.png"),
  getImage("media/ball/2point-12.png"),
  getImage("media/ball/2point-13.png"),
  getImage("media/ball/2point-14.png"),
]

let lightBallAnimation = [
  getImage("media/ball/light-1.png"),
  getImage("media/ball/light-2.png"),
  getImage("media/ball/light-3.png"),
  getImage("media/ball/light-4.png"),
  getImage("media/ball/light-5.png"),
  getImage("media/ball/light-6.png"),
]

let heavyBallAnimation = [getImage("media/ball/heavy-1.png")]

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
    let xOffset = -GameEngine.getProperty("playerAngle", 3) * 1
    xOffset = Math.max(-2, xOffset)
    xOffset = Math.min(2, xOffset)

    let ballPickedUpPlayer = GameEngine.getProperty("ballPickedUpPlayer", 1)

    if (
      !ballPickedUpPlayer ||
      parseInt(ballPickedUpPlayer) === id ||
      ids.includes(parseInt(ballPickedUpPlayer)) === false
    ) {
      GameEngine.emit("jump", {
        power: 16,
        xOffset: xOffset,
        rotation: 0,
        ids: [id],
      })
    }

    GameEngine.emit("changeProperty", {
      property: "balanceAngle",
      value: [id, balanceAngle],
    })
  }

  GameEngine.emit("raiseArm", { ids: ids, value: true })

  startCharging()
}

function stopJump(side) {
  let ids
  let target
  let rotation
  if (side === "right") {
    arrowUpPressed = false
    ids = playerRightIds
    target = [-10.5, 13]
    rotation = 10
  } else if (side === "left") {
    keyWPressed = false
    ids = playerLeftIds
    target = [10.5, 13]
    rotation = -10
  }

  let ballPickedUpPlayer = GameEngine.getProperty("ballPickedUpPlayer", 1)

  if (ids.includes(parseInt(ballPickedUpPlayer))) {
    GameEngine.emit("rotateBall", { id: 1, value: rotation })
  }

  let xOffset = getRandomInt(-80, 80) / 50
  GameEngine.emit("stopJump", { ids: ids })
  GameEngine.emit("throwBall", {
    ids: ids,
    targetPosition: target,
    targetXOffset: xOffset,
    throttle: chargeValue / 100,
  })

  stopCharging()
  resetCharging()
  GameEngine.emit("raiseArm", { ids: ids, value: false })
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

function spawnBall(x, y, id, size, kind) {
  let frameList = normalBallAnimation
  let bounciness = 0.6
  let density = 0.01

  if (kind === "DOUBLE POINT") {
    frameList = doubleBallAnimation
  } else if (kind === "HEAVY BALL") {
    bounciness = 0
    density = 0.05
    frameList = heavyBallAnimation
  } else if (kind === "LIGHT BALL") {
    bounciness = 0.9
    frameList = lightBallAnimation
  }
  console.log(kind, frameList)

  GameEngine.emit("spawnBall", {
    x: x,
    y: y,
    id: id,
    size: size,
    frameList: frameList,
    bounciness: bounciness,
    density: density,
  })
}

function spawnPlayer(side, x, y, id) {
  let top = new Image()
  top.src = "media/tops/normal-1.png"

  let pants = new Image()
  pants.src = "media/pants/normal-1.png"

  let armRightNormalImage = new Image()
  armRightNormalImage.src = "media/arm-right-normal.png"

  let headRightImage = new Image()
  headRightImage.src = "media/head-right.png"

  let bodyRightImage = new Image()
  bodyRightImage.src = "media/body-right.png"

  GameEngine.emit("spawnPlayer", {
    side: side,
    x: x,
    y: y,
    id: id,
    team: 2,
    armSize: "normal",
    armTexture: armRightNormalImage,
    headTexture: headRightImage,
    bodyTexture: bodyRightImage,
  })
}

export function start() {
  console.log(1)

  scoreLeft = 0
  scoreRight = 0

  displayScoreBoards(true)

  startGame(true)
}

function startGame(first = false) {
  GameEngine.emit("changeProperty", { property: "score", value: false })
  GameEngine.emit("changeProperty", { property: "speed", value: 1 / 60 })
  jumpingEnabled = true

  // Modifiers

  let ballKind = "normal"

  let modifiers

  if (first === true) {
    modifiers = {}
  } else {
    modifiers = getModifiers()
  }

  let message = ""

  for (let index in modifiers) {
    let modifer = modifiers[index]
    if ((index == modifiers.length - 1)) {
      message += modifer
    } else {
      message = message + modifer + " + "
    }

    if (modifer === "double") {
      ballKind = "double"
    } else if (modifer === "heavy") {
      ballKind = "heavy"
    } else if (modifer === "light") {
      ballKind = "light"
    }
  }

  console.log(message)

  displayMessage(message)

  // console.log(ballKind)

  // MAP

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

  let menuCover = document.querySelector("#menu-cover")

  GameEngine.emit("changeProperty", { property: "speed", value: 0 })

  setTimeout(() => {
    spawnBall(0, 10, 1, 0.6, ballKind)

    spawnPlayer("right", 8.1, 0, 4)
    spawnPlayer("right", 3.5, 0, 3)

    spawnPlayer("left", -8.1, 0, 1)
    spawnPlayer("left", -3.5, 0, 2)

    for (let index in playerAllIds) {
      let id = playerAllIds[index]
      let offset = getRandomInt(-100, 100)
      const currentBalanceAngle = offset / 2000

      setTimeout(() => {
        GameEngine.emit("changeProperty", {
          property: "balanceAngle",
          value: [id, currentBalanceAngle],
        })
      }, 1000)
    }

    setTimeout(() => {
      GameEngine.emit("changeProperty", { property: "speed", value: 1 / 60 })
    }, 400)

    setTimeout(() => {
      GameEngine.emit("rotatePlayer", {
        ids: [1],
        value: getRandomInt(-400, -380),
      })
      GameEngine.emit("rotatePlayer", {
        ids: [2],
        value: getRandomInt(-400, -380),
      })
      GameEngine.emit("rotatePlayer", {
        ids: [3],
        value: getRandomInt(380, 400),
      })
      GameEngine.emit("rotatePlayer", {
        ids: [4],
        value: getRandomInt(380, 400),
      })
    }, 500)
  }, 100)

  document.addEventListener("keydown", function (event) {
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
  })

  document.addEventListener("keyup", function (event) {
    if (event.code === "ArrowUp") {
      stopJump("right")
    } else if (event.code === "KeyW") {
      stopJump("left")
    }
  })
}

// Other

function wigglePlayer(id) {
  setTimeout(() => {
    GameEngine.emit("rotatePlayer", {
      ids: [parseInt(id)],
      value: getRandomArrayElement([-300, 300]),
    })
  }, 100)
}

GameEngine.on("playerLand", ({ playerId }) => {
  wigglePlayer(playerId)
})

GameEngine.on("score", ({ side }) => {
  console.log("score", side)
  GameEngine.emit("changeProperty", { property: "speed", value: 1 / 300 })
  jumpingEnabled = false

  if (side === "left") {
    basketAnimation("media/basket-text-blue.png")
    scoreRight++
    updateScore("right", scoreRight)
  } else {
    basketAnimation("media/basket-text-red.png")
    scoreLeft++
    updateScore("left", scoreLeft)
  }

  if (scoreLeft > 4) {
    setTimeout(() => {
      endGame()
      return
    }, 2000)
  } else if (scoreRight > 4) {
    setTimeout(() => {
      endGame()
      return
    }, 2000)
  } else {
    setTimeout(() => {
      fadeOut()
    }, 2300)
    setTimeout(() => {
      GameEngine.emit("killAllPlayers", {})
      GameEngine.emit("killAllBalls", {})
    }, 2520)
    setTimeout(() => {
      startGame()
    }, 2550)
    setTimeout(() => {
      fadeIn()
    }, 2700)
  }
})
