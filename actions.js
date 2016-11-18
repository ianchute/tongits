const actions = {

  drawCard: function(e) {

    fetch('http://localhost:8082/drawcard?id=' + localStorage.token, () => {})

  }

}
