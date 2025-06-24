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

// let basicGameplayButton = document.createElement("img")
// basicGameplayButton.src = "./media/play-button-2-2PvP.png"
// basicGameplayButton.classList.add("game-button")
// buttonList.appendChild(basicGameplayButton)

// let addModButton = document.createElement("img")
// addModButton.src = "./media/add-button.png"
// addModButton.classList.add("game-button")
// buttonList.appendChild(addModButton)

// function showMenu() {
//   menuCover.style.transition = "all 200ms"
//   menuCover.style.backgroundColor = menuCoverColor
// }

function hideMenu() {
  menuCover.style.transition = "all 200ms"
  menuCover.style.backgroundColor = "rgba(0,0,0,0)"
}

function buttonHover(event) {
  event.target.style.height = "180px"
}

function buttonLeave(event) {
  event.target.style.height = "150px"
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

// function addButton(modSource, imageSource) {
//   let button = document.createElement("img")
//   button.src = "./media/" + imageSource
//   button.classList.add("game-button")
//   button.style.order = 1
//   buttonList.appendChild(button)

//   button.addEventListener("mouseenter", buttonHover)
//   button.addEventListener("mouseleave", buttonLeave)

//   button.addEventListener("click", function (event) {
//     hideButtonsAndMenu()
//     startGame(modSource)
//   })
// }
// addButton("2-2PvP.js", "play-button-2-2PvP.png")

// let addModButton = document.createElement("img")
// addModButton.src = "./media/add-button.png"
// addModButton.classList.add("game-button")
// addModButton.style.order = 2
// buttonList.appendChild(addModButton)

// addModButton.addEventListener("mouseenter", buttonHover)
// addModButton.addEventListener("mouseleave", buttonLeave)

// addModButton.addEventListener("click", function (event) {
//   console.log("add")

//   const input = document.createElement("input")
//   input.type = "file"
//   input.multiple = true

//   input.onchange = () => {
//     const file = input.files[0]
//     if (file) {
//       const name = file.name.toLowerCase()
//       if (name.endsWith(".png")) {
//         console.log("Adding PNG.")
//       } else if (name.endsWith(".js")) {
//         console.log("Adding JS.")
//       } else {
//         throw new Error("Unsupported file format.")
//       }
//     }
//   }

//   input.click()
// })

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
  killAllBalls()
  killAllPlayers()
  changeMap()
  displayScoreBoards(false)
}

window.addEventListener("message", (event) => {
  const data = event.data
  const source = data.source
  const action = data.action
  if (action === "add-button") {
    addModButton(source, data.image)
  } else if (action === "end-game") {
    endGame()
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
  }  else if (action === "engine/killAllBalls") {
    killAllBalls()
  }else if (action === "engine/killAllPlayers") {
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
