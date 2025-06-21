# Basket Random Modded

## GameEngine Communication

This section explains the functions used to send and receive data between your mod and the game engine.

To communicate with the `GameEngine`, include the following in your script:

```js
import { GameEngine, startEngine } from "../game-engine.js"
```

### Definitions*

*image*:
```js
let img = new Image()
img.src = “media/(filename)”
```

```ballId```: unique id of ball, used for identifying ball

```playerId```: unique id of player, used for identifying player

```offsetInfo```: array containing information about offset - ```[xPositionOffset, yPositionOffset, xScaleOffset, yScaleOffset]```

### Sending data

```spawnPlayer``` - **spawns player with unique id**

```js
GameEngine.emit("spawnPlayer", {
      side: str,
      x: num,
      y: num,
      id: num,
      team: 2,
      armSize: str/num,
      armAttachedTextures: [[image, offsetInfo], ...],
      headAttachedTextures: [[image, offsetInfo], ...],
      bodyAttachedTextures: [[image, offsetInfo], ...]),
})
```

side - “left” or “right”
x - x coordinate of position
y - y coordinate of position 
id - ```playerId```
armSize: “short”, “normal”, “long” or num
armAttachedTextures - array of attached images* with their offsetInfo*
headAttachedTextures - array of attached images* with their offsetInfo*
bodyAttachedTextures - array of attached images* with their offsetInfo*

```spawnBall``` - **spawns ball**

```js
GameEngine.emit("spawnBall", { x, y, id, size, frameList, bounciness })
```

x - x coordinate of position 
y - y coordinate of position 
id - ```ballId```
size - 
frameList - array of images*
bounciness - 

```jump``` - **boosts the player upwards relatively**

```js
GameEngine.emit("jump", {
	power: num,
	xOffset: num,
	rotation: num,
	ids: [id1, id2, …],
})
```

power - strength of jump on y axis
xOffset - strength of jump on x axis
rotation - additional rotation vector added to jump
ids - an array containing unique ```playerId```s of players

```raiseArm``` - **value in engine that raises arm**

```js
GameEngine.emit("raiseArm", { ids: [id1, id2, …], value: bool })
```

ids - an array containing unique ```playerId```s of players affected 
value - true for arm to raise, false for it to not raise

```throwBall``` - **tells the engine to throw the ball to target, automatically calculating the needed vector**

```js
GameEngine.emit("throwBall", {
	ids: [id1, id2, …],
    targetPosition: [targetX, targetY],
    targetXOffset: num,
	throttle: num,
})
```

ids - an array containing ```playerId```s of players affected 
targetX - x coordinate of target
targetY - y coordinate of target 
targetXOffset - x offset of target (decapricated)
throttle - power of throw in percentage, 0/100 is no throw, 50/100 is half power, 100/100 is normal power, 200/100 is double power, etc.

```rotateBall``` - **spins the ball**

```js
GameEngine.emit("rotateBall", { id: num, value: num })
```

id - ```ballId```
value - rotation value

```killPlayer``` - **removes a player from the game**

```js
GameEngine.emit("killPlayer", { id: num })
```

id - ```playerId```

```killAllPlayers``` - **removes all players from the game**

```js
GameEngine.emit("killAllPlayers", {})
```

```killBall``` - **removes a ball from the game**

```js
GameEngine.emit("killBall", { id: num })
```

id - ```ballId```

```killAllBalls``` - **removes all balls from the game**

```js
GameEngine.emit("killAllBalls", {})
```

```changeProperty``` - **changes property in GameEngine**

```js
GameEngine.emit("changeProperty", {
	property: property,
	value: value,
})
```