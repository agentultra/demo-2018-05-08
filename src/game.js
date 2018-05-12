const canvas = document.getElementById('stage')
, stage = canvas.getContext('2d')
, stageW = 800
, stageH = 480
, tileSize = 16
, state = {}
, dir = {
    NORTH: 0,
    SOUTH: 1,
    EAST:  2,
    WEST:  3
}
, buttons = {
    Up: 0,
    Down: 0,
    Left: 0,
    Right: 0,
    Fire: 0
}
, tiles = {
    FLOOR: {color: 'gray'},
    WALL: {color: 'dark-gray'}
}

// max map size: 50 x 30

canvas.width = stageW
canvas.height = stageH

const clr = () => {
    stage.fillStyle = 'black'
    stage.fillRect(0, 0, stageW, stageH)
}

const btn = name => buttons.hasOwnProperty(name) && buttons[name]

const always = x => () => x

const range = (n, def = 0) => Array.from({length: n}, always(def))

const init = () => Object.assign(state, {
    player: {
        x: 20,
        y: 20,
        dx: 0,
        dy: 0,
        w: 10,
        h: 10,
        speed: 1.8,
        facing: dir.NORTH,
        firing: false
    },
    playerBullets: [],
    map: TileMap(50, 30)
})

const Bullet = (x, y, dx, dy) => ({
    x, y, dx, dy
})

const TileMap = (w, h, def=tiles.FLOOR) => ({
    w, h,
    tiles: range(w * h, def)
})

const getTile = (x, y, map) => {
    return map.tiles[y * map.w + x]
}

const setTile = (x, y, t, map) => {
    map.tiles[y * map.w + x] = t
}

const update = dt => {
    const {player, playerBullets} = state

    if (btn('Up')) {
        if (player.facing !== dir.NORTH) {
            player.facing = dir.NORTH
        } else {
            player.dy = -player.speed
        }
    }
    if (btn('Down')) {
        if (player.facing !== dir.SOUTH) {
            player.facing = dir.SOUTH
        } else {
            player.dy = player.speed
        }
    }
    if (btn('Left')) {
        if (player.facing !== dir.EAST) {
            player.facing = dir.EAST
        } else {
            player.dx = -player.speed
        }
    }
    if (btn('Right')) {
        if (player.facing !== dir.WEST) {
            player.facing = dir.WEST
        } else {
            player.dx = player.speed
        }
    }
    if (!btn('Up') && !btn('Down')) player.dy = 0
    if (!btn('Left') && !btn('Right')) player.dx = 0

    if (btn('Fire') && !player.firing) {
        player.firing = true
        console.log('Pew!')
        switch (player.facing) {
        case dir.NORTH:
            playerBullets.push(Bullet(player.x, player.y - player.h, 0, -10))
            break;
        case dir.SOUTH:
            playerBullets.push(Bullet(player.x, player.y + player.h, 0, 10))
            break;
        case dir.EAST:
            playerBullets.push(Bullet(player.x - player.w, player.y, -10, 0))
            break;
        case dir.WEST:
            playerBullets.push(Bullet(player.x + player.w, player.y, 10, 0))
            break;
        }
    }
    if (!btn('Fire')) player.firing = false

    for (let b of playerBullets) {
        if (b.x < 0 || b.x > stageW) {
            b.dead = true
        }
        if (b.y < 0 || b.y > stageH) {
            b.dead = true
        }
        b.x += b.dx
        b.y += b.dy
    }

    state.player.x += state.player.dx
    state.player.y += state.player.dy

    state.playerBullets = playerBullets.filter(b => !b.dead)
}

const drawMap = map => {
    const {w, h, tiles} = map
    for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {
            const t = getTile(i, j, map)
            stage.fillStyle = t.color
            stage.fillRect(i * tileSize, j * tileSize, tileSize, tileSize)
        }
    }
}

const drawPlayer = player => {
    const {x, y, w, h, facing} = player
    const sx = x - (w / 2)
    , sy = y - (h / 2)

    stage.fillStyle = 'yellow'
    stage.strokeStyle = 'red'
    stage.fillRect(sx, sy, w, h)
    stage.beginPath()
    stage.moveTo(x, y)
    if (facing === dir.NORTH) {
        stage.lineTo(x, y - h)
    } else if (facing === dir.SOUTH) {
        stage.lineTo(x, y + h)
    } else if (facing === dir.EAST) {
        stage.lineTo(x - w, y)
    } else if (facing === dir.WEST) {
        stage.lineTo(x + w, y)
    }
    stage.stroke()
}

const drawPlayerBullets = bullets => {
    for (let b of bullets) {
        stage.fillStyle = 'yellow'
        if (b.dx != 0) {
            stage.fillRect(b.x, b.y, 6, 3)
        }
        if (b.dy != 0) {
            stage.fillRect(b.x, b.y, 3, 6)
        }
    }
}

const render = () => {
    clr()

    const {player, playerBullets, map} = state

    drawMap(map)
    drawPlayer(player)
    drawPlayerBullets(playerBullets)
}

const loop = dt => {
    update(dt)
    render()
    window.requestAnimationFrame(loop)
}

init()
window.requestAnimationFrame(loop)

window.addEventListener('keydown', ev => {
    if (ev.key === 'w') {
        buttons.Up = 1
    } else if (ev.key === 's') {
        buttons.Down = 1
    } else if (ev.key === 'a') {
        buttons.Left = 1
    } else if (ev.key === 'd') {
        buttons.Right = 1
    } else if (ev.key === ' ') {
        buttons.Fire = 1
    }
})

window.addEventListener('keyup', ev => {
    if (ev.key === 'w') {
        buttons.Up = 0
    } else if (ev.key === 's') {
        buttons.Down = 0
    } else if (ev.key === 'a') {
        buttons.Left = 0
    } else if (ev.key === 'd') {
        buttons.Right = 0
    } else if (ev.key === ' ') {
        buttons.Fire = 0
    }
})
