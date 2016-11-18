const app = require('express')()
const _ = require('underscore')

const Card = require('./Card')
const Deck = require('./Deck')

const crypto = require('crypto')
const xor = require('./xor')

const games = {}

function preprocessGame(game, side, ip) {

  console.log(game)

  game = JSON.parse(JSON.stringify(game)) // clone game

  if (game) {

    delete game.waiting

    game.decks.undrawn = new Deck(
      _.times(game.decks.undrawn.cards.length, () => new Card('', ''))
    )

  }

  if (side === 'm') {

    if (ip !== game.ip_my) return {}

    delete game.ip_my
    delete game.ip_enemy

    game.decks.enemy = new Deck(
      _.times(game.decks.enemy.cards.length, () => new Card('', ''))
    )

    return game

  } else if (side === 'e') {

    if (ip !== game.ip_enemy) return {}

    delete game.ip_my
    delete game.ip_enemy

    game.decks.my = game.decks.enemy

    game.decks.enemy = new Deck(
      _.times(game.decks.enemy.cards.length, () => new Card('', ''))
    )

    return game

  } else {
    return {}
  }

}

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8081')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  next()
})

app.get('/token', function (req, res) {

  const waitingGames = _(games).keys().filter(key => games[key].waiting)

  if (waitingGames.length) {
    games[waitingGames[0]].waiting = false
    games.ip_enemy = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    console.log('e')
    res.end(waitingGames[0] + 'e') // e indicates that this player is the 'enemy' -- the secondary player
  } else {
    console.log('m')
    res.end(crypto.randomBytes(512).toString('base64') + 'm') // m indicates that this player is 'me' -- the primary player
  }

})

app.get('/numberofgames', function (req, res) {

  const n = _.keys(games).length.toString()
  res.end(n)

})

app.get('/game', function (req, res) {

  const id = req.query.id
  const side = req.query.side
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

  if (!id) {
    res.end('{}')
    return
  }

  const game = games[id]

  if (game) {

    const preprocessedGame = preprocessGame(games[id], side, ip)
    const gameString = JSON.stringify(game)

    res.end(gameString)
    return

  } else {

    // Enemy cannot initialize game.
    if (side === 'e') {
      res.end('{}')
      return
    }

    const deck = new Deck()
    deck.shuffle()

    const data = {
      decks: {
        my: deck.draw(12),
        enemy: deck.draw(12),
        undrawn: deck,
        drawn: new Deck([]),
      },
      waiting: true,
      ip_my: ip
    }

    games[id] = data
    const gameString = JSON.stringify(preprocessGame(data, side, ip))
    res.end(gameString)

  }

})

app.get('/drawcard', function(req, res) {

  const id = req.query.id
  games[id].decks.undrawn.shuffle()
  const drawnCard = games[id].decks.undrawn.draw()
  games[id].decks.my.add(drawnCard)
  res.end('true')

})

const server = app.listen(8082, () => {
  const port = server.address().port
  console.log('Tong-its server: Listening to port %s', port)
})
