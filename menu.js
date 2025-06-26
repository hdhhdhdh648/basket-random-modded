// console.log("Hello world!")

import { GameEngine } from "./game-engine.js"

import {
  displayMessage,
  displayScoreBoards,
  changeMap,
  basketAnimation,
  updateScore,
  fadeOut,
  fadeIn,
  togglePause,
} from "./mod-dependencies/graphics.js"

// import { start2_2PvP } from "./mods/2-2PvP.js"

// import {}

// export function endGame() {
//   showMenu()
//   showAllButtons()
// }

// export function modTesting() {
//   console.info("Mod works")
// }

// window.modTesting = modTesting

// export function addModButton(script, image) {
//   console.info("Add button", script, image)
// }

// window.addModButton = addModButton

let menuCoverColor = "rgb(18, 10, 105)"

let menuCover = document.querySelector("#menu-cover")
menuCover.style.backgroundColor = menuCoverColor

let buttonList = document.querySelector("#button-list")

function showMenu() {
  menuCover.style.transition = "all 200ms"
  menuCover.style.backgroundColor = menuCoverColor
  menuCover.style.pointerEvents = "all"

  showButtons()
}

function hideMenu() {
  menuCover.style.transition = "all 200ms"
  menuCover.style.backgroundColor = "rgba(0,0,0,0)"
  menuCover.style.pointerEvents = "none"
}

function buttonHover(event) {
  event.target.style.height = "180px"
}

function buttonLeave(event) {
  event.target.style.height = "150px"
}

function showButtons() {
  for (const button of buttonList.children) {
    button.style = "transition: all 300ms cubic-bezier(0.08, 0.75, 0.06, 1.19);"
    button.addEventListener("mouseenter", buttonHover)
    button.addEventListener("mouseleave", buttonLeave)
    setTimeout(() => {
      button.style.height = "150px"
      button.style.transition = "none"
    }, 100)
  }
}

function hideButtonsAndMenu() {
  for (const button of buttonList.children) {
    button.style = "transition: all 300ms cubic-bezier(0.77,-0.36, 0.96, 0.57);"
    button.removeEventListener("mouseenter", buttonHover)
    button.removeEventListener("mouseleave", buttonLeave)
    setTimeout(() => {
      button.style.height = "0px"
      hideMenu()
    }, 100)
  }
}

function startGame(script) {
  window.postMessage(
    {
      source: "menu",
      action: "start",
      mod: script,
    },
    "*"
  )
}

function addModButton(script, image) {
  let button = document.createElement("img")
  button.src = image
  button.classList.add("game-button")
  button.style.order = 1
  buttonList.appendChild(button)

  button.addEventListener("mouseenter", buttonHover)
  button.addEventListener("mouseleave", buttonLeave)

  button.addEventListener("click", function (event) {
    hideButtonsAndMenu()
    startGame(script)
  })
}

function getImage(source) {
  let image = new Image()
  image.src = source
  return image
}

function engineSpawnPlayer(data) {
  console.log(data)

  for (let imageInfo of data.bodyAttachedTextures) {
    imageInfo[0] = getImage(imageInfo[0])
  }

  for (let imageInfo of data.armAttachedTextures) {
    imageInfo[0] = getImage(imageInfo[0])
  }

  for (let imageInfo of data.headAttachedTextures) {
    imageInfo[0] = getImage(imageInfo[0])
  }

  GameEngine.emit("spawnPlayer", {
    side: data.side,
    x: data.x,
    y: data.y,
    id: data.id,
    team: 2,
    armSize: data.armSize,
    feetFriction: data.feetFriction,
    armAttachedTextures: data.armAttachedTextures,
    headAttachedTextures: data.headAttachedTextures,
    bodyAttachedTextures: data.bodyAttachedTextures,
  })
}

function engineChangeProperty(property, value) {
  GameEngine.emit("changeProperty", {
    property: property,
    value: value,
  })
}

let placeholderImage = new Image()
placeholderImage.src = "media/play-button.png"

// let images = {}

function engineSpawnBall(x, y, id, size, frameList, bounciness, density) {
  for (const index in frameList) {
    let frame = frameList[index]
    frameList[index] = getImage(frame)
  }

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

// let properties = {}

// GameEngine.on("updateProperty", ({ property, value }) => {
//   properties[property] = value
//   console.log(properties)
// })

function engineStartJump(power, xOffset, rotation, ids) {
  GameEngine.emit("jump", {
    power: power,
    xOffset: xOffset,
    rotation: rotation,
    ids: ids,
  })
}

function engineStopJump(ids) {
  GameEngine.emit("stopJump", { ids: ids })
}

function engineRaiseArm(ids, value) {
  GameEngine.emit("raiseArm", { ids: ids, value: value })
}

function engineRotateBall(id, value) {
  GameEngine.emit("rotateBall", { id: id, value: value })
}

function engineThrowBall(ids, targetPosition, targetXOffset, throttle) {
  console.log(ids)
  GameEngine.emit("throwBall", {
    ids: ids,
    targetPosition: targetPosition,
    targetXOffset: targetXOffset,
    throttle: throttle,
  })
}

function engineRotatePlayer(ids, value) {
  GameEngine.emit("rotatePlayer", {
    ids: ids,
    value: value,
  })
}

function killAllPlayers() {
  GameEngine.emit("killAllPlayers", {})
}

function killAllBalls() {
  GameEngine.emit("killAllBalls", {})
}

function endGame() {
  showMenu()

  setTimeout(() => {
    killAllBalls()
    killAllPlayers()
    changeMap()
    displayScoreBoards(false)
    togglePause(false)
  }, 200)
}

window.addEventListener("message", (event) => {
  const data = event.data
  const source = data.source
  const action = data.action
  if (action === "add-button") {
    addModButton(source, data.image)
  } else if (action === "end-game") {
    endGame()
  } else if (action === "toggle-pause") {
    togglePause(data.value)
  } else if (action === "engine/spawnPlayer") {
    engineSpawnPlayer(data)
  } else if (action === "engine/startJump") {
    engineStartJump(data.power, data.xOffset, data.rotation, data.ids)
  } else if (action === "engine/rotatePlayer") {
    engineRotatePlayer(data.ids, data.value)
  } else if (action === "engine/stopJump") {
    engineStopJump(data.ids)
  } else if (action === "engine/changeProperty") {
    engineChangeProperty(data.property, data.value)
  } else if (action === "engine/raiseArm") {
    engineRaiseArm(data.ids, data.value)
  } else if (action === "engine/rotateBall") {
    engineRotateBall(data.id, data.value)
  } else if (action === "engine/killAllBalls") {
    killAllBalls()
  } else if (action === "engine/killAllPlayers") {
    killAllPlayers()
  } else if (action === "engine/throwBall") {
    engineThrowBall(
      data.ids,
      data.targetPosition,
      data.targetXOffset,
      data.throttle
    )
  } else if (action === "engine/spawnBall") {
    engineSpawnBall(
      data.x,
      data.y,
      data.id,
      data.size,
      data.frameList,
      data.bounciness,
      data.density
    )
  } else if (action === "graphics/displayMessage") {
    displayMessage(data.message)
  } else if (action === "graphics/displayScoreBoards") {
    displayScoreBoards(data.value)
  } else if (action === "graphics/changeMap") {
    changeMap(data.map)
  } else if (action === "graphics/basketAnimation") {
    basketAnimation(data.image)
  } else if (action === "graphics/updateScore") {
    updateScore(data.side, data.score)
  } else if (action === "graphics/fadeIn") {
    fadeIn()
  } else if (action === "graphics/fadeOut") {
    fadeOut()
  }
})
