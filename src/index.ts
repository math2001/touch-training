import "./style.css";

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
  const fieldRect = field.getBoundingClientRect()
  const playerSize = Math.round(Math.min(fieldRect.width * 10/100, fieldRect.height * 10/100));

  for (let player of players) {
    player.style.width = playerSize + "px";
    player.style.height = playerSize + "px";
  }

  // set initial positions
  setInitialPosition(players, playerSize);
  // handle dragging

  let dragging: {div: HTMLElement, offsetx: number, offsety: number} | null = null;
  for (let player of players)
  {
    player.addEventListener("mousedown", e => {
      e.preventDefault()
      if (!dragging)
        dragging = {div: player, offsetx: e.offsetX, offsety: e.offsetY};
    })
  }

  field.addEventListener("mousemove", e => {
    if (!dragging)
      return;
    const rect = field.getBoundingClientRect()
    const left = e.pageX - dragging.offsetx - rect.left + "px";
    const top = e.pageY - dragging.offsety - rect.top + "px";
    dragging.div.style.left = left;
    dragging.div.style.top = top;
  });

  field.addEventListener("mouseup", e => {
    dragging = null;
  })

  document.querySelector("#toolbar-btn-reset")?.addEventListener("click", e => {
    setInitialPosition(players, playerSize);
  })
  
}

main()