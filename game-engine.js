// game-engine.js

/*

Copyright notice from the original game, covers all assets of the game.

Copyright (c) 2015-2021, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

// Properties

let playerBalanceAngleList = {}
let disableBalancing = {}
let raiseArm = {} // id, true/false
let ballList = {} // id, body
let ballSizeList = {} // id, size:num
let ballFrameList = {}
let ballFrameIndex = {}
let ballDensityList = {} // id, density: num
let ballIsPickedUp = {} // ballId, true/false
let ballPickedUpPlayer = {} // ballId, playerId
let playerPickedUpBall = {} // playerId, ballId
let playerIsPickedUpBall = {} // playerId, true/false
let playerBallReach = {} // playerId, reach:num
let isPlayerPickingUpDisabled = {} // playerId, true/false
let playerAirborne = {} // playerId, true/false/null
let playerList = {} // id, [feet, body, head, arm, hand, headHitbox]
let playerJointList = {} // id, [feetBodyJoint, headHitboxBodyJoint, headBodyJoint, armBodyJoint, armHandJoint]
let playerSideList = {} // id, "normal"/"flip"
let playerFeetList = {} // playerId, body
let armSizeList = {} // id, size: num
let textureList = {} // id, [armAttachedTextures, headAttachedTextures, bodyAttachedTextures]
let playerTeam = {} // playerId, teamId

// let playerShadows = {} // playerId, shadow

// Engine and canvas setup

let SCALE = 50
let SIMULATION_SPEED = 1 / 60

const RAISE = 4.5

const DEV_RENDER = true

let orders = {}

const canvas = document.getElementById("canvas")
const div = document.querySelector("div")

const ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false
ctx.webkitImageSmoothingEnabled = false
ctx.mozImageSmoothingEnabled = false
ctx.msImageSmoothingEnabled = false

canvas.width = "2000"
canvas.height = "1000"

// import planck from 'planck-js'
// import planck from 'https://unpkg.com/planck-js@latest/dist/planck.mjs'
const pl = planck
const Vec2 = pl.Vec2
const world = new pl.World(Vec2(0, -15))

function updateProperty(property, value) {
  // GameEngine.emit("updateProperty", { property: property, value: value })
  window.postMessage(
    {
      source: "game-engine",
      action: "propertyChange",
      property: property,
      value: value,
    },
    "*"
  )
}

// Media

let headRightImage = new Image()
headRightImage.src = "media/head-right.png"

let armRightNormalImage = new Image()
armRightNormalImage.src = "media/arm-right-normal.png"

let hoopLeftImage = new Image()
hoopLeftImage.src = "media/hoop-left.png"

let hoopLeftTopImage = new Image()
hoopLeftTopImage.src = "media/hoop-left-top.png"

let hoopLeftBackImage = new Image()
hoopLeftBackImage.src = "media/hoop-left-back.png"

let shadowImage = new Image()
shadowImage.src = "media/shadow.png"

let hoopShadowImage = new Image()
hoopShadowImage.src = "media/hoop-shadow.png"

let hoopNetLeftImage = new Image()
hoopNetLeftImage.src = "media/net-left.png"

// Ground
const ground = world.createBody()
ground.createFixture(pl.Edge(Vec2(-40, RAISE), Vec2(40, RAISE)), {
  friction: 0.3,
  filterCategoryBits: 0x0001,
})

// Events

export class EventEmitter {
  constructor() {
    this.events = {}
  }

  on(eventName, fn) {
    ;(this.events[eventName] ||= []).push(fn)
  }

  emit(eventName, data) {
    ;(this.events[eventName] || []).forEach((fn) => fn(data))
  }

  getProperty(property, value) {
    return getProperty(property, value)
  }
}

export const GameEngine = new EventEmitter()

GameEngine.on("changeProperty", ({ property, value }) => {
  changeProperty(property, value)
})

GameEngine.on(
  "spawnPlayer",
  ({
    side,
    x,
    y,
    id,
    team,
    reach,
    armSize,
    armWidth,
    feetFriction,
    armAttachedTextures,
    headAttachedTextures,
    bodyAttachedTextures,
    // armTexture,
    // armTextureOffset,
    // headTexture,
    // headTextureOffset,
    // bodyTexture,
    // bodyTextureOffset,
    // attachedTextures,
  }) => {
    spawnPlayer(
      side,
      x,
      y,
      id,
      team,
      reach,
      armSize,
      armWidth,
      feetFriction,
      armAttachedTextures,
      headAttachedTextures,
      bodyAttachedTextures
      // armTexture,
      // armTextureOffset,
      // headTexture,
      // headTextureOffset,
      // bodyTexture,
      // bodyTextureOffset,
      // attachedTextures
    )
  }
)

function getImage(source) {
  let image = new Image()
  image.src = source
  return image
}

GameEngine.on(
  "spawnBall",
  ({ x, y, id, size, frameList, bounciness, density }) => {
    spawnBall(x, y, id, size, frameList, bounciness, density)
  }
)

GameEngine.on("jump", ({ power, xOffset, rotation, ids }) => {
  for (let id of ids) {
    if (!playerList[id]) {
      return
    }
    let [feet, body, head, arm, hand] = playerList[id]
    jump(body, feet, power, xOffset, rotation)
    disableBalancing[id] = true
    setTimeout(() => {
      disableBalancing[id] = false
    }, 200)
    playerAirborne[id] = true
  }
})

GameEngine.on("stopJump", ({ ids }) => {
  for (let id of ids) {
    if (!playerList[id]) {
      return
    }
    let [feet, body, head, arm, hand] = playerList[id]
    disableBalancing[id] = false
    // releaseBall(id)
    // raiseArm[id] = false
  }
})

GameEngine.on("raiseArm", ({ ids, value }) => {
  for (let id of ids) {
    raiseArm[id] = value
  }
})

GameEngine.on("playerPickingUpDisabled", ({ ids, value }) => {
  for (let id of ids) {
    raiseArm[id] = value
  }
})

GameEngine.on(
  "throwBall",
  ({ ids, targetPosition, targetXOffset, throttle }) => {
    for (let id of ids) {
      if (playerIsPickedUpBall[id] === true) {
        throwBall(
          playerPickedUpBall[id],
          targetPosition,
          targetXOffset,
          throttle
        )
      }
    }
  }
)

GameEngine.on("rotatePlayer", ({ ids, value }) => {
  rotatePlayer(ids, value)
})

GameEngine.on("rotateBall", ({ id, value }) => {
  rotateBall(id, value)
})

export function startEngine() {
  setTimeout(() => {
    GameEngine.emit("engineReady", "success")
  }, 2000)
}

// Event functions

function getProperty(property, value) {
  if (property === "playerAngle") {
    return getPlayerAngle(value)
  } else if (property === "ballIsPickedUp") {
    return ballIsPickedUp[value]
  } else if (property === "ballPickedUpPlayer") {
    return ballPickedUpPlayer[value]
  } else if (property === "playerPickedUpBall") return playerPickedUpBall[value]
}

function changeProperty(property, value) {
  if (property === "balanceAngle") {
    const id = value[0]
    const angle = value[1]

    playerBalanceAngleList[id] = angle
  } else if (property === "scale") {
    SCALE = value
  } else if (property === "gravity") {
  } else if (property === "speed") {
    SIMULATION_SPEED = value

    if (SIMULATION_SPEED === 0) {
      ballAnimationDisabled = true
    } else {
      ballAnimationDisabled = false
    }

    changeBallInterval((1 / SIMULATION_SPEED / 60) * 100)
  } else if (property === "score") {
    score = value
  }
}

function ballChangeFrame() {
  if (ballAnimationDisabled === true) return
  // setInterval(() => {
  for (let ballId in ballList) {
    if (!ballList[ballId]) {
      return
    }
    const velocityX = ballList[ballId].getLinearVelocity().x
    const isPickedUp = ballIsPickedUp[ballId]
    if (Math.abs(velocityX) > 0.1 && isPickedUp !== true) {
      // HERE
      let currentIndex = ballFrameIndex[ballId]
      let nextIndex = currentIndex + 1
      if (nextIndex > ballFrameList[ballId].length - 1) {
        nextIndex = 0
      }
      ballFrameIndex[ballId] = nextIndex
    }
  }
  // }, 100)
}

let ballAnimationDisabled = false

let ballIntervalId
let currentBallInterval = 100

function startBallInterval() {
  clearInterval(ballIntervalId)
  ballIntervalId = setInterval(ballChangeFrame, currentBallInterval)
}

function changeBallInterval(newInterval) {
  currentBallInterval = newInterval
  startBallInterval()
}

startBallInterval()

let bodiesToDestroy = []
let jointsToDestroy = []

let playersToKill = []
let ballsToKill = []

GameEngine.on("killPlayer", ({ id }) => {
  KillPlayer(id)
})

GameEngine.on("killAllPlayers", ({}) => {
  KillAllPlayers()
})

function killHandler() {
  for (const id of playersToKill) {
    playerList[id] = null

    playerIsPickedUpBall[id] = null
    playerBallReach[id] = null
    playerBalanceAngleList[id] = null
    playerPickedUpBall[id] = null
    playerAirborne[id] = null
    playerIsPickedUpBall[id] = null
    playerTeam[id] = null
    playerSideList[id] = null
    playerFeetList[id] = null
    isPlayerPickingUpDisabled[id] = null
  }
  playersToKill.length = 0

  for (const id of ballsToKill) {
    ballList[id] = null

    ballDensityList[id] = null
    ballFrameIndex[id] = null
    ballFrameList[id] = null
    ballIsPickedUp[id] = null
    ballPickedUpPlayer[id] = null
  }
  ballsToKill.length = 0
}

function KillPlayer(id) {
  for (let index in playerList[id]) {
    bodiesToDestroy.push(playerList[id][index])
    // world.destroyBody(playerList[id][index])
  }

  // playerList[id] = null

  // playerIsPickedUpBall[id] = null
  // playerBallReach[id] = null
  // playerBalanceAngleList[id] = null
  // playerPickedUpBall[id] = null
  // playerAirborne[id] = null
  // playerIsPickedUpBall[id] = null
  // playerTeam[id] = null
  // playerSideList[id] = null
  // playerFeetList[id] = null

  playersToKill.push(id)

  for (let index in playerJointList[id]) {
    jointsToDestroy.push(playerJointList[id][index])
    // world.destroyJoint(playerJointList[id][index])
  }

  playerJointList[id] = null
}

function KillAllPlayers() {
  for (let id in playerList) {
    KillPlayer(id)
  }
}

GameEngine.on("killBall", ({ id }) => {
  KillBall(id)
})

GameEngine.on("killAllBalls", ({}) => {
  KillAllBalls()
})

function KillBall(id) {
  // world.destroyBody(ballList[id])
  bodiesToDestroy.push(ballList[id])

  ballsToKill.push(id)

  // ballList[id] = null

  // ballDensityList[id] = null
  // ballFrameIndex[id] = null
  // ballFrameList[id] = null
  // ballIsPickedUp[id] = null
  // ballPickedUpPlayer[id] = null
}

function KillAllBalls() {
  for (let id in ballList) {
    KillBall(id)
  }
}

function bodyDestroyHandler() {
  for (const body of bodiesToDestroy) {
    // if (!body) return
    world.destroyBody(body)
  }
  bodiesToDestroy.length = 0
}

function jointDestroyHandler() {
  for (const joint of jointsToDestroy) {
    // if (!joint) return
    world.destroyJoint(joint)
  }
  jointsToDestroy.length = 0
}

function spawnBall(
  x,
  y,
  id,
  size,
  frameList,
  bounciness = 0.6,
  density = 0.01
) {
  const ball = world.createDynamicBody(Vec2(x, y + RAISE))
  ball.createFixture(pl.Circle(size), {
    density: density,
    restitution: bounciness,
    friction: 1,
  })
  ballList[id] = ball
  ballSizeList[id] = size
  ballDensityList[id] = density
  ballFrameList[id] = frameList

  ball.setAngularDamping(2)

  ballFrameIndex[id] = 0
}

// Hoops

const HOOP_DISTANCE = 14.4

let hoopLeft = {}
let hoopRight = {}

// spawnHoop("left", HOOP_DISTANCE, 0, 0)
// spawnHoop("right", HOOP_DISTANCE, 0, 0)

GameEngine.on("spawnHoop", ({ side, distance, height, width }) => {
  // spawnHoop(side, distance, height, width)s
  if (side === "left") {
    orders["spawnHoopLeft"] = [distance, height, width]
  } else if (side === "right") {
    orders["spawnHoopRight"] = [distance, height, width]
  }
})

function destroyLeftHoop() {
  for (let index in hoopLeft) {
    let object = hoopLeft[index]
    if (
      typeof object.getType === "function" &&
      typeof object.getPosition === "function"
    ) {
      world.destroyBody(object)
    } else if (
      typeof object.getAnchorA === "function" &&
      typeof object.getBodyA === "function"
    ) {
      world.destroyJoint(object)
    }

    hoopLeft[index] = null
  }
}

function destroyRightHoop() {
  for (let index in hoopRight) {
    let object = hoopRight[index]
    if (
      typeof object.getType === "function" &&
      typeof object.getPosition === "function"
    ) {
      world.destroyBody(object)
      hoopRight[index] = null
    } else if (
      typeof object.getAnchorA === "function" &&
      typeof object.getBodyA === "function"
    ) {
      world.destroyJoint(object)
      hoopRight[index] = null
    }
  }
}

function spawnHoop(side, distance = 14.4, height = 0, width = 0) {

  let direction = 1

  if (side === "left") {
    direction = -1
    destroyLeftHoop()
  } else {
    destroyRightHoop()
  }

  const hoop1 = world.createBody({
    position: Vec2(direction * HOOP_DISTANCE, 3.6 + RAISE + height / 2),
  })
  hoop1.createFixture(pl.Box(0.4, 3.6 + height / 2), {
    density: 1,
    restitution: 0,
    filterCategoryBits: 0x0001,
  })

  const hoop2 = world.createBody({
    type: "dynamic",
    position: Vec2(direction * (HOOP_DISTANCE - 0.9), 7.5 + RAISE + height),
  })
  hoop2.createFixture(pl.Box(1.3, 0.3), {
    density: 1,
    restitution: 0.5,
    filterCategoryBits: 0x0004,
    filterMaskBits: ~0x0004,
  })

  const hoop3 = world
    .createBody
    // Vec2(direction * (HOOP_DISTANCE - 2.3), 8.9 + RAISE + height)
    ()
  hoop3.createFixture(pl.Box(0.25, 2.4), {
    restitution: 0.5,
    filterCategoryBits: 0x0004,
  })

  const hoop4 = world
    .createBody
    // Vec2(direction * (HOOP_DISTANCE - 2.7), 7.35 + RAISE + height)
    ()
  hoop4.createFixture(pl.Box(0.25, 0.25), {
    restitution: 0.5,
    filterCategoryBits: 0x0004,
  })

  const hoop5 = world
    .createBody
    // Vec2(direction * (HOOP_DISTANCE - 4.75), 7.35 + RAISE + height)
    ()
  hoop5.createFixture(pl.Box(0.1, 0.25), {
    restitution: 0.5,
    filterCategoryBits: 0x0004,
  })

  const hoopTarget = world.createBody(
    Vec2(direction * (HOOP_DISTANCE - 3.9), 8 + RAISE + height)
  )
  hoopTarget.createFixture(pl.Box(0.5, 0.5), {
    restitution: 0.5,
    isSensor: true,
  })

  const hoopNet = world.createBody({
    position: Vec2(direction * (HOOP_DISTANCE - 3.9), 6.4 + RAISE + height),
  })
  hoopNet.createFixture(pl.Box(0.5, 0.5), {
    restitution: 0.5,
    isSensor: true,
  })

  const anchor = Vec2(direction * HOOP_DISTANCE, RAISE + 7 + height)

  const hoopJoint = world.createJoint(
    pl.RevoluteJoint(
      {
        localAnchorA: hoop2.getLocalPoint(anchor),
        localAnchorB: hoop1.getLocalPoint(anchor),
        enableLimit: true,
        lowerAngle: 0,
        upperAngle: 0,
      },
      hoop2,
      hoop1
    )
  )

  if (side === "left") {
    hoopLeft["1"] = hoop1
    hoopLeft["2"] = hoop2
    hoopLeft["3"] = hoop3
    hoopLeft["4"] = hoop4
    hoopLeft["5"] = hoop5
    hoopLeft["target"] = hoopTarget
    hoopLeft["net"] = hoopNet
    hoopLeft["joint"] = hoopJoint
    hoopLeft["width"] = width
  } else {
    hoopRight["1"] = hoop1
    hoopRight["2"] = hoop2
    hoopRight["3"] = hoop3
    hoopRight["4"] = hoop4
    hoopRight["5"] = hoop5
    hoopRight["target"] = hoopTarget
    hoopRight["net"] = hoopNet
    hoopRight["joint"] = hoopJoint
    hoopRight["width"] = -width
  }
}

// const hoopLeft1 = world.createBody({
//   position: Vec2(-HOOP_DISTANCE, 3.6 + RAISE),
// })
// hoopLeft1.createFixture(pl.Box(0.4, 3.6), {
//   density: 1,
//   restitution: 0,
//   filterCategoryBits: 0x0001,
// })

// const hoopLeft2 = world.createBody({
//   type: "dynamic",
//   position: Vec2(-HOOP_DISTANCE + 0.9, 7.5 + RAISE),
// })
// hoopLeft2.createFixture(pl.Box(1.3, 0.3), {
//   density: 1,
//   restitution: 0.5,
//   filterCategoryBits: 0x0004,
//   filterMaskBits: ~0x0004,
// })

// const hoopLeft3 = world.createBody(Vec2(-HOOP_DISTANCE + 2.3, 8.9 + RAISE))
// hoopLeft3.createFixture(pl.Box(0.25, 2.4), {
//   restitution: 0.5,
//   filterCategoryBits: 0x0004,
// })

// const hoopLeft4 = world.createBody(Vec2(-HOOP_DISTANCE + 2.7, 7.35 + RAISE))
// hoopLeft4.createFixture(pl.Box(0.25, 0.25), {
//   restitution: 0.5,
//   filterCategoryBits: 0x0004,
// })

// const hoopLeft5 = world.createBody(Vec2(-HOOP_DISTANCE + 4.75, 7.35 + RAISE))
// hoopLeft5.createFixture(pl.Box(0.1, 0.25), {
//   restitution: 0.5,
//   filterCategoryBits: 0x0004,
// })

// const hoopLeftTarget = world.createBody(Vec2(-HOOP_DISTANCE + 3.9, 8 + RAISE))
// hoopLeftTarget.createFixture(pl.Box(0.5, 0.5), {
//   restitution: 0.5,
//   isSensor: true,
// })

// const hoopLeftNet = world.createBody({
//   position: Vec2(-HOOP_DISTANCE + 3.9, 6.4 + RAISE),
// })
// hoopLeftNet.createFixture(pl.Box(0.5, 0.5), {
//   restitution: 0.5,
//   isSensor: true,
// })

// const anchorLeft = Vec2(-HOOP_DISTANCE, RAISE + 7)

// const hoopLeftJoint = world.createJoint(
//   pl.RevoluteJoint(
//     {
//       localAnchorA: hoopLeft2.getLocalPoint(anchorLeft),
//       localAnchorB: hoopLeft1.getLocalPoint(anchorLeft),
//       enableLimit: true,
//       lowerAngle: 0,
//       upperAngle: 0,
//     },
//     hoopLeft2,
//     hoopLeft1
//   )
// )

// const hoopRight1 = world.createBody({
//   position: Vec2(HOOP_DISTANCE, 3.6 + RAISE),
// })
// hoopRight1.createFixture(pl.Box(0.4, 3.6), {
//   restitution: 0,
//   density: 1,
//   filterCategoryBits: 0x0001,
// })

// const hoopRight2 = world.createBody({
//   type: "dynamic",
//   position: Vec2(HOOP_DISTANCE - 0.9, 7.5 + RAISE),
// })
// hoopRight2.createFixture(pl.Box(1.3, 0.3), {
//   restitution: 0.5,
//   density: 1,
//   filterCategoryBits: 0x0004,
//   filterMaskBits: ~0x0004,
// })

// const hoopRight3 = world.createBody(Vec2(HOOP_DISTANCE - 2.3, 8.9 + RAISE))
// hoopRight3.createFixture(pl.Box(0.25, 2.4), {
//   restitution: 0.5,
//   filterCategoryBits: 0x0004,
// })

// const hoopRight4 = world.createBody(Vec2(HOOP_DISTANCE - 2.7, 7.35 + RAISE))
// hoopRight4.createFixture(pl.Box(0.25, 0.25), {
//   restitution: 0.5,
//   filterCategoryBits: 0x0004,
// })

// const hoopRight5 = world.createBody(Vec2(HOOP_DISTANCE - 4.75, 7.35 + RAISE))
// hoopRight5.createFixture(pl.Box(0.1, 0.25), {
//   restitution: 0.5,
//   filterCategoryBits: 0x0004,
// })

// const hoopRightTarget = world.createBody(Vec2(HOOP_DISTANCE - 3.9, 8 + RAISE))
// hoopRightTarget.createFixture(pl.Box(0.5, 0.5), {
//   restitution: 0.5,
//   isSensor: true,
// })

// const hoopRightNet = world.createBody({
//   position: Vec2(HOOP_DISTANCE - 3.9, 6.5 + RAISE),
// })
// hoopRightNet.createFixture(pl.Box(0.5, 0.5), {
//   restitution: 0.5,
//   isSensor: true,
// })

// const anchorRight = Vec2(HOOP_DISTANCE, RAISE + 7)

// const hoopRightJoint = world.createJoint(
//   pl.RevoluteJoint(
//     {
//       localAnchorA: hoopRight2.getLocalPoint(anchorRight),
//       localAnchorB: hoopRight1.getLocalPoint(anchorRight),
//       enableLimit: true,
//       lowerAngle: 0,
//       upperAngle: 0,
//     },
//     hoopRight2,
//     hoopRight1
//   )
// )

// const anchorRightNet = Vec2(-HOOP_DISTANCE, RAISE + 7)

// const hoopNetRightJoint = world.createJoint(
//   pl.RevoluteJoint(
//     {
//       localAnchorA: hoopRight2.getLocalPoint(anchorRightNet),
//       localAnchorB: hoopRightNet.getLocalPoint(anchorRightNet),
//       enableLimit: true,
//       lowerAngle: 1,
//       upperAngle: 1,
//     },
//     hoopRight2,
//     hoopRightNet
//   )
// )

// world.createJoint(
//     pl.WeldJoint(
//       {
//         collideConnected: false,
//         referenceAngle: 0,
//       },
//       body,
//       headHitbox,
//       Vec2(0, 0)
//     )
//   )

// Player spawning

function spawnPlayer(
  side,
  x,
  y,
  id,
  team,
  reach = 1.8,
  armSize = 1.2,
  armWidth = 0.3,
  feetFriction = 2,
  armAttachedTextures,
  headAttachedTextures,
  bodyAttachedTextures
) {
  playerTeam[id] = team

  if (side === "left") {
    playerSideList[id] = "flip"
    side = -1
  } else {
    playerSideList[id] = "normal"
    side = 1
  }

  playerBallReach[id] = reach

  textureList[id] = [
    armAttachedTextures,
    headAttachedTextures,
    bodyAttachedTextures,
  ]

  // Feet

  const feet = world.createDynamicBody(Vec2(x, 1.4 + RAISE - 0.9 + y))
  feet.createFixture(pl.Circle(0.5), {
    density: 1,
    friction: feetFriction,
    // friction: 0.1,
    filterCategoryBits: 0x0002,
    filterMaskBits: 0x0001,
  })
  playerFeetList[id] = feet
  // Body
  const body = world.createDynamicBody(Vec2(x, 2.8 + RAISE - 0.9 + y))
  body.createFixture(pl.Box(0.4, 1.6), {
    density: 1,
    friction: 0.3,
    restitution: 0.5,
    filterCategoryBits: 0x0001,
    filterMaskBits: 0x0001 | 0x0002 | 0x0003,
  })
  // Weight (center of mass to be under to balance player)
  //  const weight = world.createDynamicBody(Vec2(10, -4+RAISE))
  // weight.createFixture(pl.Box(0.5, 0.5), {
  //   density: 1,
  //   friction: 0.3,
  //   restitution: 0.5,
  //   isSensor: true
  // })
  // Head
  const head = world.createDynamicBody(
    Vec2(x - 0.15 * side, 4.9 + RAISE - 0.9 + y)
  )
  head.createFixture(pl.Box(0.35, 0.4), {
    density: 0.2,
    friction: 0.3,
    restitution: 0.5,
    filterCategoryBits: 0x0002,
    filterMaskBits: 0x0001,
  })
  // Head hitbox
  const headHitbox = world.createDynamicBody(
    Vec2(x - 0.15 * side, 4.9 + RAISE - 0.9 + y)
  )
  headHitbox.createFixture(pl.Box(0.35, 0.5), {
    density: 0.2,
    friction: 0.3,
    // restitution: 0.5,
    filterCategoryBits: 0x0003,
    filterMaskBits: 0x0001,
  })
  // Arm
  if (armSize === "normal") {
    armSize = 1.2
  } else if (armSize === "short") {
    armSize = 0.95
  } else if (armSize === "long") {
    armSize = 1.45
  }
  const arm = world.createDynamicBody(
    Vec2(x + 0.4 * side, 3.45 - armSize + RAISE + y)
  )
  arm.createFixture(pl.Box(0.3, armSize), {
    density: 0.02,
    friction: 0.3,
    isSensor: true,
  })
  // Hand
  const hand = world.createDynamicBody(
    Vec2(x + 0.4 * side, 3.9 - (armSize * 3) / 2 + RAISE - 0.9 + y)
  )
  hand.createFixture(pl.Box(0.2, 0.2), {
    density: 0.01,
    friction: 0.3,
    isSensor: true,
  })

  armSizeList[id] = armSize

  // Adds player parts to array

  playerList[id] = [feet, body, head, arm, hand, headHitbox]

  // Connects feet and body

  let feetBodyJoint = world.createJoint(
    pl.WeldJoint(
      {
        collideConnected: false,
        referenceAngle: 0,
      },
      body,
      feet,
      Vec2(x, 10 + RAISE + y - 0.9)
    )
  )

  // Connects head hitbox and body

  let headHitboxBodyJoint = world.createJoint(
    pl.WeldJoint(
      {
        collideConnected: false,
        referenceAngle: 0,
      },
      body,
      headHitbox,
      Vec2(x, 10 + RAISE + y - 0.9)
    )
  )

  // Connects head and body

  let headBodyJoint = world.createJoint(
    pl.RevoluteJoint(
      {
        collideConnected: false,
        enableLimit: true,
        lowerAngle: -0.25,
        upperAngle: 0.25,
      },
      head,
      body,
      Vec2(x - 0.1 * side, 4.4 + RAISE + y - 0.9)
    )
  )

  // Connects arm and body

  let armBodyJoint = world.createJoint(
    pl.RevoluteJoint(
      {
        collideConnected: false,
        enableMotor: true,
      },
      arm,
      body,
      Vec2(x + 0.4 * side, 4.2 + RAISE + y - 0.9)
    )
  )

  // Connects arm and hand

  let armHandJoint = world.createJoint(
    pl.WeldJoint(
      {
        collideConnected: false,
        enableMotor: true,
      },
      arm,
      hand,
      Vec2(x + 0.4 * side, 4.2 + RAISE + y - 0.9)
    )
  )

  // Adds joints to array

  playerJointList[id] = [
    feetBodyJoint,
    headHitboxBodyJoint,
    headBodyJoint,
    armBodyJoint,
    armHandJoint,
  ]
}

function pointArmRightDown(arm, targetAngle = 0, stiffness = 4, damping = 0.5) {
  const currentAngle = arm.getAngle()
  const angularVelocity = arm.getAngularVelocity()

  const angleError = targetAngle - currentAngle
  const torque = stiffness * angleError - damping * angularVelocity

  arm.applyTorque(torque)
}

// Render functions

function renderImage(image, flip, body, xOffset, yOffset, xScale, yScale) {
  const pos = body.getPosition()
  const angle = body.getAngle()
  const canvasPos = toCanvas(pos)

  ctx.save()
  ctx.translate(canvasPos.x, canvasPos.y)
  ctx.rotate(-angle)

  if (flip === true) {
    ctx.scale(-1, 1)
  }

  ctx.drawImage(
    image,
    -xScale / 2 + xOffset,
    -yScale / 2 + yOffset,
    xScale,
    yScale
  )

  ctx.restore()
}

function renderHead(id) {
  let [armAttachedTextures, headAttachedTextures, bodyAttachedTextures] =
    textureList[id]
  let [feet, body, head, arm] = playerList[id]

  // renderBox(head)
  // return

  let flip = false
  if (playerSideList[id] === "flip") {
    flip = true
  }

  // renderBox(head)

  for (let index in headAttachedTextures) {
    let textureInfo = headAttachedTextures[index]
    let [image, [xOffset, yOffset, xScale, yScale]] = textureInfo

    renderImage(image, flip, head, xOffset, yOffset, xScale, yScale)
  }
}

function renderBody(id) {
  let [armAttachedTextures, headAttachedTextures, bodyAttachedTextures] =
    textureList[id]
  let [feet, body, head, arm] = playerList[id]

  // renderBox(body)
  // // renderBox(feet)
  // return

  let flip = false
  if (playerSideList[id] === "flip") {
    flip = true
  }

  // renderBox(body)

  for (let index in bodyAttachedTextures) {
    let textureInfo = bodyAttachedTextures[index]
    let [image, [xOffset, yOffset, xScale, yScale]] = textureInfo

    renderImage(image, flip, body, xOffset, yOffset, xScale, yScale)
  }
}

function renderArm(id) {
  let [armAttachedTextures, headAttachedTextures, bodyAttachedTextures] =
    textureList[id]
  let [feet, body, head, arm] = playerList[id]

  let flip = false
  if (playerSideList[id] === "flip") {
    flip = true
  }

  // renderBox(arm)

  for (let index in armAttachedTextures) {
    let textureInfo = armAttachedTextures[index]
    let [image, [xOffset, yOffset, xScale, yScale]] = textureInfo

    renderImage(image, flip, arm, xOffset, yOffset, xScale, yScale)
  }
}

function renderBall(ball, size, frameList, frameIndex) {
  if (!ball) {
    return
  }

  // const pos = ball.getPosition()
  // const angle = ball.getAngle()
  // const canvasPos = toCanvas(pos)

  // ctx.save()
  // ctx.translate(canvasPos.x, canvasPos.y)
  // ctx.rotate(-angle)

  // ctx.drawImage(
  //   frameList[frameIndex],
  //   (-SCALE / 2) * 2 * size,
  //   (-SCALE / 2) * 2 * size,
  //   SCALE * 2 * size,
  //   SCALE * 2 * size
  // )

  // ctx.restore()

  renderImage(frameList[frameIndex], false, ball, 0, 0, 60, 60)
}

function renderBalls() {
  for (let id in ballList) {
    if (ballIsPickedUp[id] === true) {
      return
    }
    // renderSphere(ballList[id], "orange")
    renderBall(
      ballList[id],
      ballSizeList[id],
      ballFrameList[id],
      ballFrameIndex[id]
    )
    //  renderSphere(ballList[id], "orange")
  }
}

function renderBallsPickedUp() {
  for (const id in ballIsPickedUp) {
    const value = ballIsPickedUp[id]

    if (value === true) {
      renderBall(
        ballList[id],
        ballSizeList[id],
        ballFrameList[id],
        ballFrameIndex[id]
      )
    }
  }
}

function renderHoopShadows() {
  if (hoopRight["1"]) {
    renderShadow(HOOP_DISTANCE, RAISE, 0.6, 0.35, hoopShadowImage, 2.2)
  }
  if (hoopRight["1"]) {
    renderShadow(-HOOP_DISTANCE, RAISE, 0.6, 0.35, hoopShadowImage, 2.2)
  }
}

function offsetBody(bodyA, bodyB, offset, copyAngle = true) {
  if (!bodyA || !bodyB) return
  const posA = bodyA.getPosition()
  const angleA = bodyA.getAngle()

  // Rotate offset manually (2D rotation)
  const cos = Math.cos(angleA)
  const sin = Math.sin(angleA)
  const rotatedOffset = planck.Vec2(
    offset.x * cos - offset.y * sin,
    offset.x * sin + offset.y * cos
  )

  // Compute world position
  const posB = posA.clone().add(rotatedOffset)

  // Set bodyB position
  bodyB.setPosition(posB)

  // Optionally copy angle
  if (copyAngle) {
    bodyB.setAngle(angleA)
  }
}

function renderHoopNetLeft() {
  if (!hoopLeft["net"] || !hoopLeft["2"]) return

  const pos = hoopLeft["net"].getPosition()
  const angle = hoopLeft["2"].getAngle()

  const canvasPos = toCanvas(pos)

  ctx.save()
  ctx.translate(canvasPos.x, canvasPos.y)
  ctx.rotate(-angle)

  const width = SCALE * 1.44
  const height = SCALE
  const dx = -width / 2
  const dy = -height / 2

  ctx.drawImage(hoopNetLeftImage, dx, dy, width, height)

  ctx.restore()
}

function renderHoopNetRight() {
  if (!hoopRight["net"] || !hoopRight["2"]) return

  const pos = hoopRight["net"].getPosition()
  const angle = hoopRight["2"].getAngle()
  const canvasPos = toCanvas(pos)

  ctx.save()
  ctx.translate(canvasPos.x, canvasPos.y)
  ctx.rotate(-angle)

  const width = SCALE * 1.44
  const height = SCALE
  const dx = -width / 2
  const dy = -height / 2

  ctx.drawImage(hoopNetLeftImage, dx, dy, width, height)

  ctx.restore()
}

function hoopLeftHandler() {
  let width = hoopLeft["width"]
  // offsetBody(hoopLeft2, hoopLeftNet, Vec2(3, -1.1))
  // offsetBody(hoopLeft2, hoopLeft3, Vec2(1.4, 1.4))
  // offsetBody(hoopLeft2, hoopLeft4, Vec2(1.8, -0.15))
  // offsetBody(hoopLeft2, hoopLeft5, Vec2(3.85, -0.15))
  offsetBody(hoopLeft["2"], hoopLeft["net"], Vec2(3, -1.1))
  offsetBody(hoopLeft["2"], hoopLeft["3"], Vec2(1.4, 1.4))
  offsetBody(hoopLeft["2"], hoopLeft["4"], Vec2(1.8, -0.15))
  offsetBody(hoopLeft["2"], hoopLeft["5"], Vec2(3.85 + width, -0.15))
}

function hoopRightHandler() {
  let width = hoopRight["width"]
  // offsetBody(hoopRight2, hoopRightNet, Vec2(-3, -1.1))
  // offsetBody(hoopRight2, hoopRight3, Vec2(-1.4, 1.4))
  // offsetBody(hoopRight2, hoopRight4, Vec2(-1.8, -0.15))
  // offsetBody(hoopRight2, hoopRight5, Vec2(-3.85, -0.15))
  offsetBody(hoopRight["2"], hoopRight["net"], Vec2(-3, -1.1))
  offsetBody(hoopRight["2"], hoopRight["3"], Vec2(-1.4, 1.4))
  offsetBody(hoopRight["2"], hoopRight["4"], Vec2(-1.8, -0.15))
  offsetBody(hoopRight["2"], hoopRight["5"], Vec2(-3.85 + width, -0.15))
}

// function renderHoopNetRight() {
//   const pos = hoopRightNet.getPosition();
//   const canvasPos = toCanvas(pos);

//   ctx.save();
//   ctx.translate(canvasPos.x, canvasPos.y);

//   // ctx.scale(-1, 1)

//   const width = SCALE * 1.75;
//   const height = SCALE;
//   const dx = -width / 2;
//   const dy = -height / 2;

//   ctx.drawImage(
//     hoopNetLeftImage,
//     dx,
//     dy,
//     width,
//     height
//   );

//   ctx.restore();
// }

function renderHoopLeft() {
  renderBox(hoopLeft["1"])

  // const pos = hoopLeft["1"].getPosition()
  // const angle = hoopLeft["1"].getAngle()
  // const canvasPos = toCanvas(pos)

  // ctx.save()
  // ctx.translate(canvasPos.x, canvasPos.y)
  // ctx.rotate(-angle)

  // ctx.drawImage(
  //   hoopLeftImage,
  //   -SCALE / 2.5,
  //   -SCALE * 3.78,
  //   SCALE * 0.8,
  //   SCALE * 0.8 * 9.21
  // )

  // ctx.restore()
}

function renderHoopLeftTop() {
  renderBox(hoopLeft["2"])
  renderBox(hoopLeft["3"])
  renderBox(hoopLeft["4"])
  renderBox(hoopLeft["5"])

  // const pos = hoopLeft["2"].getPosition()
  // const angle = hoopLeft["2"].getAngle()
  // const canvasPos = toCanvas(pos)

  // ctx.save()
  // ctx.translate(canvasPos.x, canvasPos.y)
  // ctx.rotate(-angle)

  // ctx.drawImage(
  //   hoopLeftTopImage,
  //   -SCALE * 1.3,
  //   -SCALE * 3.77,
  //   SCALE * 4.8 * 1.12,
  //   SCALE * 4.8
  // )

  // ctx.restore()
}

function renderHoopRight() {
  renderBox(hoopRight["1"])

  // const pos = hoopRight["1"].getPosition()
  // const angle = hoopRight["1"].getAngle()
  // const canvasPos = toCanvas(pos)

  // ctx.save()
  // ctx.translate(canvasPos.x, canvasPos.y)
  // ctx.rotate(-angle)
  // ctx.scale(-1, 1)

  // ctx.drawImage(
  //   hoopLeftImage,
  //   -SCALE / 2.5,
  //   -SCALE * 3.78,
  //   SCALE * 0.8,
  //   SCALE * 0.8 * 9.21
  // )

  // ctx.restore()
}

function renderHoopRightTop() {
  renderBox(hoopRight["2"])
  renderBox(hoopRight["3"])
  renderBox(hoopRight["4"])
  renderBox(hoopRight["5"])
  // const pos = hoopRight["2"].getPosition()
  // const angle = hoopRight["2"].getAngle()
  // const canvasPos = toCanvas(pos)

  // ctx.save()
  // ctx.translate(canvasPos.x, canvasPos.y)
  // ctx.rotate(-angle)
  // ctx.scale(-1, 1)

  // ctx.drawImage(
  //   hoopLeftTopImage,
  //   -SCALE * 1.3,
  //   -SCALE * 3.77,
  //   SCALE * 4.8 * 1.12,
  //   SCALE * 4.8
  // )

  // ctx.restore()
}

function renderHoopLeftBack() {
  renderBox(hoopLeft["2"])
  // const pos = hoopLeft["2"].getPosition()
  // const angle = hoopLeft["2"].getAngle()
  // const canvasPos = toCanvas(pos)

  // ctx.save()
  // ctx.translate(canvasPos.x, canvasPos.y)
  // ctx.rotate(-angle)
  // // ctx.scale(1, 1)

  // ctx.drawImage(
  //   hoopLeftBackImage,
  //   SCALE * 1.9,
  //   -SCALE / 2.22,
  //   SCALE * 0.685 * 3.17,
  //   SCALE * 0.685
  // )

  // ctx.restore()
}

function renderHoopRightBack() {
  renderBox(hoopRight["2"])
  // const pos = hoopRight["2"].getPosition()
  // const angle = hoopRight["2"].getAngle()
  // const canvasPos = toCanvas(pos)

  // ctx.save()
  // ctx.translate(canvasPos.x, canvasPos.y)
  // ctx.rotate(-angle)
  // ctx.scale(-1, 1)

  // ctx.drawImage(
  //   hoopLeftBackImage,
  //   SCALE * 1.9,
  //   -SCALE / 2.22,
  //   SCALE * 0.685 * 3.17,
  //   SCALE * 0.685
  // )

  // ctx.restore()
}

// For testing
function renderSphere(sphere, color) {
  const pos = sphere.getPosition()
  const canvasPos = toCanvas(pos)
  ctx.beginPath()
  ctx.arc(
    canvasPos.x,
    canvasPos.y,
    sphere.getFixtureList().getShape().m_radius * SCALE,
    0,
    2 * Math.PI
  )
  ctx.fillStyle = color
  ctx.fill()
}

// For testing
function renderBox(part, color) {
  if (!part) return

  const pos = part.getPosition()
  const angle = part.getAngle()
  const fixture = part.getFixtureList()
  if (!fixture) return
  const shape = fixture.getShape()

  const canvasPos = toCanvas(pos)

  ctx.save()
  ctx.translate(canvasPos.x, canvasPos.y)
  ctx.rotate(-angle)
  ctx.fillStyle = color

  const vertices = shape.m_vertices.map((v) => ({
    x: v.x * SCALE,
    y: -v.y * SCALE,
  }))

  ctx.beginPath()
  ctx.moveTo(vertices[0].x, vertices[0].y)
  for (let i = 1; i < vertices.length; i++) {
    ctx.lineTo(vertices[i].x, vertices[i].y)
  }
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  simulate()
}

function toCanvas(pos) {
  return {
    x: canvas.width / 2 + pos.x * SCALE,
    y: canvas.height - pos.y * SCALE,
  }
}

function renderShadow(
  x,
  y,
  size,
  opacity,
  image = shadowImage,
  dimensions = 1.75
) {
  const pos = Vec2(x, y)
  const canvasPos = toCanvas(pos)

  ctx.save()
  ctx.translate(canvasPos.x, canvasPos.y)
  ctx.globalAlpha = opacity

  const width = SCALE * dimensions * size
  const height = SCALE * size
  const dx = -width / 2
  const dy = -height / 2

  ctx.drawImage(image, dx, dy, width, height)

  ctx.restore()
}

function renderShadows() {
  for (let playerId in playerList) {
    if (!playerList[playerId]) {
      return
    }
    let [feet, body, head, arm, hand] = playerList[playerId]
    let positionX = feet.getPosition().x
    let positionY = feet.getPosition().y
    let size = 0.9 - 0.07 * (positionY - RAISE - 0.5)
    renderShadow(positionX, RAISE + 0.1, size, 0.15)
  }
  for (let ballId in ballList) {
    let ball = ballList[ballId]
    let positionX = ball.getPosition().x
    let positionY = ball.getPosition().y

    let size = 0.6 - 0.07 * Math.min(5, positionY - RAISE - 0.5)
    renderShadow(positionX, RAISE + 0.1, size, 0.15)
  }
}

function areBodiesTouching(bodyA, bodyB) {
  if (!bodyA || !bodyB) {
    return
  }
  for (
    let contact = world.getContactList();
    contact;
    contact = contact.getNext()
  ) {
    const fixtureA = contact.getFixtureA()
    const fixtureB = contact.getFixtureB()
    const contactBodyA = fixtureA.getBody()
    const contactBodyB = fixtureB.getBody()

    if (
      (contactBodyA === bodyA && contactBodyB === bodyB) ||
      (contactBodyA === bodyB && contactBodyB === bodyA)
    ) {
      if (contact.isTouching()) {
        return true
      }
    }
  }
  return false
}

let score = false

let ballLeftTop = false
let ballLeftBottom = false

function scoreLeftHandler() {
  // let top = areBodiesTouching(ballList[1], hoopLeftTarget)
  // let bottom = areBodiesTouching(ballList[1], hoopLeftNet)

  let top = areBodiesTouching(ballList[1], hoopLeft["target"])
  let bottom = areBodiesTouching(ballList[1], hoopLeft["net"])

  if (top === true && ballLeftBottom === false) {
    ballLeftTop = true
  } else if (bottom === true && ballLeftTop === false) {
    ballLeftBottom = true
  } else {
    ballLeftBottom = false
    ballLeftTop = false
  }

  if (
    bottom === true &&
    ballLeftTop === true &&
    ballLeftBottom === false &&
    ballIsPickedUp[1] !== true &&
    score === false
  ) {
    score = true
    window.postMessage(
      {
        source: "game-engine",
        action: "score",
        side: "left",
      },
      "*"
    )
    // GameEngine.emit("score", { side: "left" })
    // SIMULATION_SPEED = 1/300
  }
}

let ballRightTop = false
let ballRightBottom = false

function scoreRightHandler() {
  // let top = areBodiesTouching(ballList[1], hoopRightTarget)
  // let bottom = areBodiesTouching(ballList[1], hoopRightNet)

  let top = areBodiesTouching(ballList[1], hoopRight["target"])
  let bottom = areBodiesTouching(ballList[1], hoopRight["net"])

  if (top === true && ballRightBottom === false) {
    ballRightTop = true
  } else if (bottom === true && ballRightTop === false) {
    ballRightBottom = true
  } else {
    ballRightBottom = false
    ballRightTop = false
  }

  if (
    bottom === true &&
    ballRightTop === true &&
    ballRightBottom === false &&
    ballIsPickedUp[1] !== true &&
    score === false
  ) {
    score = true
    window.postMessage(
      {
        source: "game-engine",
        action: "score",
        side: "right",
      },
      "*"
    )
    // GameEngine.emit("score", { side: "right" })
    // SIMULATION_SPEED = 1/300
  }
}

function simulate() {
  scoreLeftHandler()
  scoreRightHandler()

  hoopLeftHandler()
  hoopRightHandler()

  renderShadows()

  ballSpeedHandler()

  renderHoopShadows()

  renderHoopLeftBack()
  renderHoopRightBack()

  renderBalls()

  renderHoopLeft()
  renderHoopRight()

  renderHoopNetLeft()
  renderHoopNetRight()

  renderHoopLeftTop()
  renderHoopRightTop()

  for (let id in playerList) {
    if (!playerList[id]) {
      return
    }
    let [feet, body, head, arm] = playerList[id]
    // ACTION FUNCTIONS
    balance(id, feet, body, playerBalanceAngleList[id])
    ballHandler()
    armHandler()

    // RENDER FUNCTIONS

    renderHead(id)
    renderBody(id)

    // TO DELETE, FOR TESTING
    // renderBox(hoopRightTarget, "green")
    // renderBox(hoopRightNet, "green")
    // renderBox(hoopLeftTarget, "green")
    // renderBox(hoopLeftNet, "green")
    // renderBox(hoopRight5, "green")
    // renderBox(hoopRig/htNet, "green")
  }

  renderBallsPickedUp()

  for (let [id, [feet, body, head, arm]] of Object.entries(playerList)) {
    renderArm(id)
  }
}

function updateProperties() {
  let playerAngleList = {}
  for (let playerId in playerList) {
    playerAngleList[playerId] = getPlayerAngle(playerId)
  }

  updateProperty("playerAngleList", playerAngleList)
  updateProperty("ballIsPickedUpList", ballIsPickedUp)
  updateProperty("ballPickedUpPlayerList", ballPickedUpPlayer)
  updateProperty("playerPickedUpBallList", playerPickedUpBall)
}

function fulfillOrders() {
  if (orders["spawnHoopRight"]) {
    spawnHoop(
      "right",
      orders["spawnHoopRight"][0],
      orders["spawnHoopRight"][1],
      orders["spawnHoopRight"][2]
    )
    orders["spawnHoopRight"] = null
  } else if (orders["spawnHoopLeft"]) {
    spawnHoop(
      "left",
      orders["spawnHoopLeft"][0],
      orders["spawnHoopLeft"][1],
      orders["spawnHoopLeft"][2]
    )
    orders["spawnHoopLeft"] = null
  }
}

function step() {
  fulfillOrders()

  world.step(SIMULATION_SPEED)

  bodyDestroyHandler()
  jointDestroyHandler()
  killHandler()

  render()
  requestAnimationFrame(step)

  updateProperties()
}

// UNSORTED

function pointArmUp(
  arm,
  flip = false,
  targetAngle = -Math.PI,
  stiffness = 4,
  damping = 0.5
) {
  if (flip === true) {
    targetAngle = targetAngle * -1
  }

  const currentAngle = arm.getAngle()
  const angularVelocity = arm.getAngularVelocity()

  const angleError = targetAngle - currentAngle
  let torque = stiffness * angleError - damping * angularVelocity

  arm.applyTorque(torque)
}

function throwBall(ballId, targetPos, targetXOffset, throttle = 1) {
  const ball = ballList[ballId]
  const playerId = ballPickedUpPlayer[ballId]

  let endPos = {
    x: targetPos[0] + targetXOffset,
    y: targetPos[1],
  }
  let startPos = { x: ball.getPosition().x, y: ball.getPosition().y }
  let velocity = computeThrowVelocity(startPos, endPos, 17)

  velocity = Vec2(velocity.x * throttle, velocity.y * throttle)

  ball.getFixtureList().setDensity(ballDensityList[ballId])
  ball.getFixtureList().setSensor(false)
  ball.setGravityScale(1)
  ball.setAwake(true)

  ball.setLinearVelocity(velocity)

  ballPickedUpPlayer[ballId] = null
  ballIsPickedUp[ballId] = false
  ballPickedUpPlayer[ballId] = null
  playerIsPickedUpBall[playerId] = false
  playerPickedUpBall[playerId] = null
  playerIsPickedUpBall[playerId] = false

  setTimeout(() => {
    // isPlayerPickingUpDisabled[playerId] = false
    setTeamPickingUp(playerId, false)
  }, 200)
}

function pickUpBall(ball, hand) {
  let position = hand.getPosition()
  ball.setPosition(Vec2(position.x, position.y))

  ball.getFixtureList().setDensity(0)
  ball.getFixtureList().setSensor(true)
  ball.setGravityScale(0)
  ball.setAwake(false)
  ball.setAngle(0)
}

function computeThrowVelocity(startPos, endPos, hMax, gravity = 15) {
  const x0 = startPos.x
  const y0 = startPos.y
  const x1 = endPos.x
  const y1 = endPos.y

  const vy = Math.sqrt(2 * gravity * (hMax - y0))
  const tUp = vy / gravity
  const tDown = Math.sqrt((2 * (hMax - y1)) / gravity)
  const tTotal = tUp + tDown
  const vx = (x1 - x0) / tTotal

  return Vec2(vx, vy)
}

function ballSpeedHandler() {
  for (let ballId in ballList) {
    const ball = ballList[ballId]
    if (!ball) {
      return
    }
    const velocityX = ballList[ballId].getLinearVelocity().x
    const velocityY = ballList[ballId].getLinearVelocity().y
    const isPickedUp = ballIsPickedUp[ballId]
    if (Math.abs(velocityX) < 0.6 && isPickedUp !== true) {
      ball.setLinearVelocity(planck.Vec2(0, velocityY))
    }
  }
}

function ballHandler() {
  for (let ballId in ballList) {
    let ball = ballList[ballId]

    if (ballIsPickedUp[ballId] === true) {
      const playerId = ballPickedUpPlayer[ballId]
      if (!playerId) {
        return
      }

      let [feet, body, head, arm, hand] = playerList[playerId]
      let position = hand.getPosition()
      ball.setPosition(Vec2(position.x, position.y))
    }

    for (let playerId in playerList) {
      let [feet, body, head, arm, hand] = playerList[playerId]
      let handPosition = hand.getPosition()
      let ballPosition = ball.getPosition()

      let distance = Math.sqrt(
        (handPosition.x - ballPosition.x) ** 2 +
          (handPosition.y - ballPosition.y) ** 2
      )

      if (
        distance < playerBallReach[playerId] &&
        ballIsPickedUp[ballId] !== true &&
        isPlayerPickingUpDisabled[playerId] !== true
      ) {
        ballIsPickedUp[ballId] = true
        ballPickedUpPlayer[ballId] = playerId
        playerIsPickedUpBall[playerId] = true
        playerPickedUpBall[playerId] = ballId
        playerIsPickedUpBall[playerId] = true

        //  isPlayerPickingUpDisabled[playerId] !== true
        setTeamPickingUp(playerId, true)

        pickUpBall(ball, hand)
      }
    }
  }
}

function setTeamPickingUp(playerId, value) {
  let wantedTeam = playerTeam[playerId]
  for (let [playerId, team] of Object.entries(playerTeam)) {
    if (team === wantedTeam) {
      isPlayerPickingUpDisabled[playerId] = value
    }
  }
}

function armHandler() {
  for (const id in playerList) {
    const value = raiseArm[id]
    const [feet, body, head, arm, hand] = playerList[id]

    let flip = false

    if (playerSideList[id] === "flip") {
      flip = true
    }

    if (value === true) {
      pointArmUp(arm, flip)
    } else {
      pointArmRightDown(arm)
    }
  }
}

function balance(id, feet, body, targetAngle = 0, options = {}) {
  if (typeof targetAngle != "number") {
    targetAngle = 0
  }

  if (feet.getPosition().y > 1.5 + RAISE || disableBalancing[id] === true) {
    return
  }
  const kp = options.kp ?? 150
  const kd = options.kd ?? 10
  const damping = options.damping ?? 1

  const theta = body.getAngle()
  const omega = body.getAngularVelocity()

  const torque = -kp * (theta - targetAngle) - kd * omega
  body.applyTorque(torque, true)

  body.setAngularVelocity(omega * damping)
}

function relativeForce(target, force) {
  const angle = target.getAngle()

  const worldDir = planck.Vec2(
    Math.cos(angle) * force.x - Math.sin(angle) * force.y,
    Math.sin(angle) * force.x + Math.cos(angle) * force.y
  )

  const additionalVelocity = worldDir.mul(1)
  // const currentVelocity = target.getLinearVelocity()
  // const newVelocity = currentVelocity.clone().add(additionalVelocity)

  target.setLinearVelocity(additionalVelocity)
}

function jump(body, feet, force, xOffset, rotation = 0) {
  if (feet.getPosition().y > 1.5 + RAISE) {
    return
  }

  relativeForce(body, planck.Vec2(xOffset, force))
  body.setAngularVelocity(rotation)
}

function getPlayerAngle(id) {
  if (!playerList[id]) {
    return
  }
  const [feet, body, head, arm, hand] = playerList[id]
  return body.c_position.a
}

function rotatePlayer(ids, rotation) {
  for (let index in ids) {
    let id = ids[index]
    let [feet, body, head, arm, hand] = playerList[id]

    const force = planck.Vec2(rotation, 0)
    const point = body.getWorldPoint(planck.Vec2(0, 1))

    body.applyForce(force, point, true)
  }
}

function rotateBall(id, rotation) {
  let ball = ballList[id]
  ball.setAngularVelocity(rotation)
}

world.on("begin-contact", (contact) => {
  // testingGetBodyCount()

  const fixtureA = contact.getFixtureA()
  const fixtureB = contact.getFixtureB()
  const bodyA = fixtureA.getBody()
  const bodyB = fixtureB.getBody()

  // const hoopLeftBodies = [hoopLeft2, hoopLeft3, hoopLeft4, hoopLeft5]
  // const hoopRightBodies = [hoopRight2, hoopRight3, hoopRight4, hoopRight5]

  const hoopLeftBodies = [
    hoopLeft["2"],
    hoopLeft["3"],
    hoopLeft["4"],
    hoopLeft["5"],
  ]
  const hoopRightBodies = [
    hoopRight["2"],
    hoopRight["3"],
    hoopRight["4"],
    hoopRight["5"],
  ]

  let isHoopLeft =
    hoopLeftBodies.includes(bodyA) || hoopLeftBodies.includes(bodyB)
  let isHoopRight =
    hoopRightBodies.includes(bodyA) || hoopRightBodies.includes(bodyB)
  let isGround = ground === bodyA || ground === bodyB

  // let isTargetLeft = hoopLeftTarget === bodyA || hoopLeftTarget === bodyB
  // let isNetLeft = hoopLeftNet === bodyA || hoopLeftNet === bodyB

  // let isTargetRight = hoopRightTarget === bodyA || hoopRightTarget === bodyB
  // let isNetRight = hoopRightNet === bodyA || hoopRightNet === bodyB

  let isBall = false
  let isFeet = false
  let feetPlayerId = null

  for (let ballId in ballList) {
    let ball = ballList[ballId]
    if (ballIsPickedUp[ballId]) {
      break
    }
    if (ball === bodyA || ball === bodyB) {
      isBall = true
    }
  }

  for (let playerId in playerFeetList) {
    let feet = playerFeetList[playerId]
    if (feet === bodyA || feet === bodyB) {
      isFeet = true
      feetPlayerId = playerId
    }
  }

  if (isHoopLeft && isBall) {
    hoopLeft["joint"].setLimits(0.05, 0)
    setTimeout(() => {
      hoopLeft["joint"].setLimits(0, 0)
    }, 200)
  } else if (isHoopRight && isBall) {
    hoopRight["joint"].setLimits(-0.05, 0)
    setTimeout(() => {
      hoopRight["joint"].setLimits(0, 0)
    }, 200)
  } else if (isFeet && isGround && playerAirborne[feetPlayerId] === true) {
    playerAirborne[feetPlayerId] = false
    window.postMessage(
      {
        source: "game-engine",
        action: "playerLand",
        playerId: feetPlayerId,
      },
      "*"
    )
    // GameEngine.emit("playerLand", { playerId: feetPlayerId })
  }
})

function testingGetBodyCount() {
  let bodyCount = 0
  for (let body = world.getBodyList(); body; body = body.getNext()) {
    bodyCount++
  }

  console.log("body count:", bodyCount)
}

step()

// window.addEventListener("message", (event) => {
//   const message = event.data
//   const source = message.source
//   const action = message.action
//   if (action === "engine/spawn-player") {
//     spawnPlayer(
//       message.side,
//       message.x,
//       message.y,
//       message.id,
//       message.team,
//       message.reach,
//       message.armSize,
//       message.armWidth,
//       message.armAttachedTextures,
//       message.headAttachedTextures,
//       message.bodyAttachedTextures
//     )
//   } else if (action === "engine/spawn-player") {
//     //
//   } else if (action === "engine/spawn-player") {
//     //
//   } else if (action === "engine/spawn-player") {
//     //
//   } else if (action === "engine/spawn-player") {
//     //
//   } else if (action === "engine/spawn-player") {
//     //
//   }
// })

// export function engine(event) {
//   const message = event.data
//   const source = message.source
//   const action = message.action
//   if (action === "engine/spawn-player") {
//     spawnPlayer(
//       message.side,
//       message.x,
//       message.y,
//       message.id,
//       message.team,
//       message.reach,
//       message.armSize,
//       message.armWidth,
//       message.armAttachedTextures,
//       message.headAttachedTextures,
//       message.bodyAttachedTextures
//     )
//   } else if (action === "engine/spawn-player") {
//     //
//   } else if (action === "engine/spawn-player") {
//     //
//   } else if (action === "engine/spawn-player") {
//     //
//   } else if (action === "engine/spawn-player") {
//     //
//   } else if (action === "engine/spawn-player") {
//     //
//   }
// }
