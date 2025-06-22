// console.log("Hello world!")

// import { start2_2PvP } from "./mods/2-2PvP.js"

export function endGame() {
  showMenu()
  showAllButtons()
}

export function modTesting() {
  console.info("Mod works!")
}

window.modTesting = modTesting

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

function showMenu() {
  menuCover.style.transition = "all 200ms"
  menuCover.style.backgroundColor = menuCoverColor
}

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

async function startGame(scriptName) {
  const module = await import("./mods/" + scriptName)
  module.start()
}

function addButton(modSource, imageSource) {
  let button = document.createElement("img")
  button.src = "./media/" + imageSource
  button.classList.add("game-button")
  button.style.order = 1
  buttonList.appendChild(button)

  button.addEventListener("mouseenter", buttonHover)
  button.addEventListener("mouseleave", buttonLeave)

  button.addEventListener("click", function (event) {
    hideButtonsAndMenu()
    startGame(modSource)
  })
}
addButton("2-2PvP.js", "play-button-2-2PvP.png")

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
