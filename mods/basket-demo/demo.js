const buttonImageUrl = getImageURL("play-button.png")

// function that adds button for this game to list of all game modes
function addButton() {
  window.postMessage(
    {
      source: "demo-mod",
      action: "add-button",
      image: buttonImageUrl,
    },
    "*"
  )
}

// When page fully loads, execute addButton
window.onload = addButton

// Executes functions on events
window.addEventListener("message", (event) => {
  const message = event.data
  const source = message.source
  const action = message.action
  // Starts game when button in menu is clicked
  if (action === "start") {
    startGame()
  }
})

function getImageURL(source) {
  return chrome.runtime.getURL(source)
}

// Send image URLs to window to later identify them
// window.postMessage(
//   {
//     source: "demo-mod",
//     action: "add-images",
//     images: {
//       "arm-right": getImageURL("arm-right.png"),
//       "head-right": getImageURL("head-right.png"),
//       "body-right": getImageURL("body-right.png"),
//       "shoe-right": getImageURL("shoe-right.png"),
//       "top-right": getImageURL("top-right.png"),
//       "pants-right": getImageURL("pants-right.png"),
//     },
//   },
//   "*"
// )

images = {
  "arm-right": getImageURL("arm-right.png"),
  "head-right": getImageURL("head-right.png"),
  "body-right": getImageURL("body-right.png"),
  "shoe-right": getImageURL("shoe-right.png"),
  "top-right": getImageURL("top-right.png"),
  "pants-right": getImageURL("pants-right.png"),
}

function spawnPlayer(x, y, side, id) {
  // Send data to window
  window.postMessage(
    {
      source: "demo-mod",
      action: "engine/spawnPlayer",
      side: side,
      x: x,
      y: y,
      id: id,
      team: 3,
      armAttachedTextures: [[images["arm-right"], [0, 0, 0.5 * 59, 0.5 * 238]]],
      headAttachedTextures: [[images["head-right"], [-3, 10, 0.28 * 179, 0.28 * 241]]],
      bodyAttachedTextures: [
        [images["body-right"], [-5, 10, 0.45 * 127, 0.45 * 394]],
        [images["shoe-right"], [-5.5, 72.5, 0.1 * 480, 0.1 * 420]],
        [images["top-right"], [0.2, -41, 0.095 * 360, 0.095 * 660]],
        [images["pants-right"], [0.2, 10, 0.095 * 3 * 120, 0.095 * 3 * 140]],
      ],
    },
    "*"
  )
}

// Starts whole game (not match)
function startGame() {
  // Functions that spawn player
  spawnPlayer(-5, 1, "left", 1)
  spawnPlayer(5, 1, "right", 2)
}