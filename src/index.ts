import "./style.css";

let playerSize: number = 0;
let fieldRect: DOMRect;

function setInitialPosition(players: HTMLElement[], playerSize: number)
{
  for (let i = 0; i < players.length; i++) {
    const player = players[i]
    if (i < players.length/2) {
      player.style.top = "calc(30% - " + playerSize/2 + "px)"
      player.classList.add("defense")
    } else {
      player.style.top = "calc(70% - " + playerSize/2 + "px)"
      player.classList.add("attack")
    }
    player.style.left = `calc(${16.6*(i%(players.length/2)) + 16.6/2}% - ${playerSize / 2}px)`
  }

}

function main() {
  const field = document.createElement("div");
  field.classList.add("field");

  const players: HTMLDivElement[] = []
  for (let i = 0; i < 12; ++i) {
    const player = document.createElement("div");
    player.classList.add("player");
    players.push(player);
    field.appendChild(player);
  }

  document.body.appendChild(field);
  fieldRect = field.getBoundingClientRect()
  playerSize = Math.round(Math.min(fieldRect.width * 10/100, fieldRect.height * 10/100));

  for (let player of players) {
    player.style.width = playerSize + "px";
    player.style.height = playerSize + "px";
  }

  // set initial positions
  setInitialPosition(players, playerSize);
  // handle dragging


  const mouseIdentifier = -1;
  const dragging: {[key: number]: {div: HTMLElement, offsetx: number, offsety: number}} = {}
  for (let player of players)
  {
    player.addEventListener("mousedown", e => {
      fieldRect = field.getBoundingClientRect()
      e.preventDefault()
      dragging[mouseIdentifier] = {div: player, offsetx: e.offsetX, offsety: e.offsetY};
    })

    player.addEventListener("touchstart", e => {
      fieldRect = field.getBoundingClientRect()
      e.preventDefault()
      const rect = player.getBoundingClientRect()
      for (let i = 0; i < e.changedTouches.length; ++i)
      {
        const id = e.changedTouches[i].identifier
        if (dragging[id])
          continue;
        const offsetx = e.changedTouches[i].pageX - rect.left;
        const offsety = e.changedTouches[i].pageY - rect.top;
        dragging[id] = {div: player, offsetx, offsety}
      } 
    })
  }

  field.addEventListener("mousemove", e => {
    const left = e.pageX - dragging[mouseIdentifier].offsetx - fieldRect.left + "px";
    const top = e.pageY - dragging[mouseIdentifier].offsety - fieldRect.top + "px";
    dragging[mouseIdentifier].div.style.left = left;
    dragging[mouseIdentifier].div.style.top = top;
  });

  field.addEventListener("touchmove", e => {
      const rect = field.getBoundingClientRect()
    for (let i = 0; i < e.changedTouches.length; ++i)
    {
      const touch = e.changedTouches[i]
      const id = touch.identifier
      const x = touch.pageX - dragging[id].offsetx - rect.left;
      const y = touch.pageY - dragging[id].offsety - rect.top;
      dragging[id].div.style.left = x / fieldRect.width * 100 + "%";
      dragging[id].div.style.top = y / fieldRect.height * 100 + "%";
    }
  });

  field.addEventListener("mouseup", e => {
    if (mouseIdentifier in dragging)
      delete(dragging[mouseIdentifier])
  })

  field.addEventListener("touchend", e => {
    for (let i = 0; i < e.changedTouches.length; ++i)
    {
      delete(dragging[e.changedTouches[i].identifier])
    }
  })

  document.querySelector("#toolbar-btn-reset")!.addEventListener("click", e => {
    setInitialPosition(players, playerSize);
  })
  
  document.querySelector("#toolbar-btn-fullscreen")!.addEventListener("click", e => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
    else {
      document.body.requestFullscreen({
        // "navigationUI": "hide",
      }).then(() => screen.orientation.lock("landscape-primary"))
    }
  })

  screen.orientation.addEventListener("change", e => {
    fieldRect = field.getBoundingClientRect()
    playerSize = Math.round(Math.min(fieldRect.width * 10/100, fieldRect.height * 10/100));
    for (let player of players)
    {
      player.style.width = playerSize + "px"
      player.style.height = playerSize + "px"
    }
  })
  
}

main()