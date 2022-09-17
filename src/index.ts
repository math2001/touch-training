import "./style.css";


window.addEventListener("online", () => {
  if (!navigator.serviceWorker.controller) return;

  // @ts-ignore
  if (navigator.connection && navigator.connection.saveData) {
    navigator.serviceWorker.controller.postMessage({
      type: `FETCH_FROM_CACHE_FIRST`,
    });
  }

  navigator.serviceWorker.controller.postMessage({
    type: `FETCH_FROM_NETWORK_FIRST`,
  });
});
window.addEventListener("offline", function () {
  if (!navigator.serviceWorker.controller) return;

  navigator.serviceWorker.controller.postMessage({
    type: `FETCH_FROM_CACHE_FIRST`,
  });
});

if ('serviceWOrkerin' in navigator)
  navigator.serviceWorker
    .register("/sw/sw.js")
    .then((reg) => {
      console.log("sw registered");
    })
    .catch((e) => {
      console.error("sw failed", e);
    });
else
  alert('no service worker')

let playerSize: number = 0;
let fieldRect: DOMRect;

function setInitialPosition(players: HTMLElement[], playerSize: number) {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (i < players.length / 2) {
      player.style.top = "calc(30% - " + playerSize / 2 + "px)";
      player.classList.add("defense");
    } else {
      player.style.top = "calc(70% - " + playerSize / 2 + "px)";
      player.classList.add("attack");
    }
    player.style.left = `calc(${
      16.6 * (i % (players.length / 2)) + 16.6 / 2
    }% - ${playerSize / 2}px)`;
  }
}

const undoStack: {
  player: HTMLElement;
  moveFromX: number;
  moveFromY: number;
  moveToX: number;
  moveToY: number;
}[] = [];
let undoStackHead = 0;

function recordAction(
  player: HTMLElement,
  moveFromX: number,
  moveFromY: number,
  moveToX: number,
  moveToY: number
) {
  undoStack[undoStackHead++] = {
    player,
    moveFromX,
    moveToY,
    moveToX,
    moveFromY,
  };
  undoStack.length = undoStackHead;
}

function undo() {
  if (undoStackHead <= 0) return;
  const frame = undoStack[--undoStackHead];
  frame.player.style.left = frame.moveFromX * 100 + "%";
  frame.player.style.top = frame.moveFromY * 100 + "%";
}

function redo() {
  if (undoStackHead >= undoStack.length) return;
  const frame = undoStack[undoStackHead++];
  frame.player.style.left = frame.moveToX * 100 + "%";
  frame.player.style.top = frame.moveToY * 100 + "%";
}

function main() {
  const field = document.createElement("div");
  field.classList.add("field");

  const players: HTMLDivElement[] = [];
  for (let i = 0; i < 12; ++i) {
    const player = document.createElement("div");
    player.classList.add("player");
    players.push(player);
    field.appendChild(player);
  }

  document.body.appendChild(field);
  fieldRect = field.getBoundingClientRect();
  playerSize = Math.round(
    Math.min((fieldRect.width * 10) / 100, (fieldRect.height * 10) / 100)
  );

  for (let player of players) {
    player.style.width = playerSize + "px";
    player.style.height = playerSize + "px";
  }

  // set initial positions
  setInitialPosition(players, playerSize);
  // handle dragging

  const mouseIdentifier = -1;
  const dragging: {
    [key: number]: {
      div: HTMLElement;
      offsetx: number;
      offsety: number;
      originX: number;
      originY: number;
    };
  } = {};

  for (let player of players) {
    player.addEventListener("mousedown", (e) => {
      fieldRect = field.getBoundingClientRect();
      e.preventDefault();
      dragging[mouseIdentifier] = {
        div: player,
        offsetx: e.offsetX,
        offsety: e.offsetY,
        originX: player.offsetLeft / fieldRect.width,
        originY: player.offsetTop / fieldRect.height,
      };
    });

    player.addEventListener("touchstart", (e) => {
      fieldRect = field.getBoundingClientRect();
      e.preventDefault();
      const rect = player.getBoundingClientRect();
      for (let i = 0; i < e.changedTouches.length; ++i) {
        const touch = e.changedTouches[i];
        if (dragging[touch.identifier]) continue;
        const offsetx = touch.pageX - rect.left;
        const offsety = touch.pageY - rect.top;
        dragging[touch.identifier] = {
          div: player,
          offsetx,
          offsety,
          originX: player.offsetLeft / fieldRect.width,
          originY: player.offsetTop / fieldRect.height,
        };
      }
    });
  }

  field.addEventListener("mousemove", (e) => {
    if (!(mouseIdentifier in dragging)) return;
    const left =
      e.pageX - dragging[mouseIdentifier].offsetx - fieldRect.left + "px";
    const top =
      e.pageY - dragging[mouseIdentifier].offsety - fieldRect.top + "px";
    dragging[mouseIdentifier].div.style.left = left;
    dragging[mouseIdentifier].div.style.top = top;
  });

  field.addEventListener("touchmove", (e) => {
    const rect = field.getBoundingClientRect();
    for (let i = 0; i < e.changedTouches.length; ++i) {
      const touch = e.changedTouches[i];
      const id = touch.identifier;
      const x = touch.pageX - dragging[id].offsetx - rect.left;
      const y = touch.pageY - dragging[id].offsety - rect.top;
      dragging[id].div.style.left = (x / fieldRect.width) * 100 + "%";
      dragging[id].div.style.top = (y / fieldRect.height) * 100 + "%";
    }
  });

  field.addEventListener("mouseup", (e) => {
    if (mouseIdentifier in dragging) {
      const d = dragging[mouseIdentifier];
      recordAction(
        d.div,
        d.originX,
        d.originY,
        d.div.offsetLeft / fieldRect.width,
        d.div.offsetTop / fieldRect.height
      );
      delete dragging[mouseIdentifier];
    }
  });

  field.addEventListener("touchend", (e) => {
    for (let i = 0; i < e.changedTouches.length; ++i) {
      const d = dragging[e.changedTouches[i].identifier];
      recordAction(
        d.div,
        d.originX,
        d.originY,
        d.div.offsetLeft / fieldRect.width,
        d.div.offsetTop / fieldRect.height
      );
      delete dragging[e.changedTouches[i].identifier];
    }
  });

  document
    .querySelector("#toolbar-btn-reset")!
    .addEventListener("click", (e) => {
      setInitialPosition(players, playerSize);
      undoStack.length = 0;
      undoStackHead = 0;
    });

  document
    .querySelector("#toolbar-btn-fullscreen")!
    .addEventListener("click", (e) => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.body
          .requestFullscreen({
            navigationUI: "hide",
          })
          .then(() => screen.orientation.lock("landscape-primary"));
      }
    });

  document
    .querySelector("#toolbar-btn-undo")!
    .addEventListener("click", (e) => {
      e.preventDefault();
      undo();
    });

  document
    .querySelector("#toolbar-btn-redo")!
    .addEventListener("click", (e) => {
      e.preventDefault();
      redo();
    });

  document.body.addEventListener("keydown", (e) => {
    if (e.key == "z" && e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      console.log("undo");
      undo();
    }
    if (e.key == "y" && e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      redo();
    }
  });

  screen.orientation.addEventListener("change", (e) => {
    fieldRect = field.getBoundingClientRect();
    playerSize = Math.round(
      Math.min((fieldRect.width * 10) / 100, (fieldRect.height * 10) / 100)
    );
    for (let player of players) {
      player.style.width = playerSize + "px";
      player.style.height = playerSize + "px";
    }
  });
}

main();
