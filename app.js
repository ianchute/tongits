class App {

  constructor(id) {

    this.id = id

    this.fetchToken()
      .then(this.startGameCycle.bind(this))

  }

  fetchToken() {

    return new Promise(resolve => {

      if (!localStorage.token || !localStorage.side) {
        fetch('http://localhost:8082/token')
          .then(o => o.text())
          .then(token => {
            localStorage.token = token.slice(0, -2)
            localStorage.side = token.slice(-1)[0]
            resolve()
          })
      } else {
        resolve()
      }

    })


  }

  startGameCycle() {

    this.gameCycle = setInterval(() => {

      fetch(`http://localhost:8082/game?id=${localStorage.token}&side=${localStorage.side}`)
        .then(o => o.json())
        .then(o => {

          if (JSON.stringify(o) === '{}') {
            this.endGameCycle()
            delete localStorage.token
            delete localStorage.side
            this.fetchToken()
              .then(this.startGameCycle.bind(this))
            return
          }

          if (!this.vue) {

            document.body.style.display = 'block'

            this.vue = new Vue({
              el: '#' + this.id,
              data: o,
              methods: actions
            })

          }

          this.vue.$data.decks = o.decks

        })

    }, 500)

  }

  endGameCycle() {

    clearInterval(this.gameCycle)

  }

}
