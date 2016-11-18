if (require && typeof(_) === 'undefined') {
  _ = require('underscore')
  Card = require('./Card')
}

class Deck {

  constructor(cards) {

    this.cards = cards || _.chain(['a','2','3','4','5','6','7','8','9','10','j','q','k'])
      .map(rank => ['spades', 'clubs', 'diams', 'hearts'].map(suit => new Card(rank, suit)))
      .flatten()
      .value()

  }

  shuffle() {

    this.cards = _.shuffle(this.cards)

  }

  draw(n = 1) {

    const drawn = []
    while(n-- > 0)
      drawn.push( this.cards.shift() )
    return new Deck( _.compact(drawn) )

  }

  add(deck) {

    deck.cards.forEach(card => this.cards.unshift(card))

  }

}

if (module && module.exports) {
  module.exports = Deck
}
