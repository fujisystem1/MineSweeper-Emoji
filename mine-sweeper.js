// Mine Sweeper.
$ = document.querySelector.bind(document);
const FIELD_WIDTH = 9,
  FIELD_HEIGHT = 9,
  BOMBS_COUNT = 10;
let field, explosion, clear, cursorX, cursorY, startTime;
const getTwoDimensionalArray = () => {
  let field = [];
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    field[y] = [];
    for (let x = 0; x < FIELD_WIDTH; x++)
      field[y][x] = { bomb: false, mine: false, flag: false };
  }
  return field;
};
const findAdjacentNodes = (func) => {
  for (let y = -1; y <= 1; y++)
    for (let x = -1; x <= 1; x++) {
      if (x === 0 && y === 0) continue;
      func(x, y);
    }
};
const getAdjacentBombsCount = (_x, _y) => {
  let n = 0;
  findAdjacentNodes((x, y) => {
    let x2 = _x + x;
    let y2 = _y + y;
    if (x2 < 0 || x2 >= FIELD_WIDTH || y2 < 0 || y2 >= FIELD_HEIGHT) return;
    if (field[y2][x2].bomb) n++;
  });
  return n;
};
const setBombs = () => {
  let n = 0;
  do {
    let x = Math.floor(Math.random() * FIELD_WIDTH);
    let y = Math.floor(Math.random() * FIELD_HEIGHT);
    if (!field[y][x].bomb) {
      field[y][x].bomb = true;
      n++;
    }
    field[y][x].bomb = true;
  } while (n < BOMBS_COUNT);
};
const setMines = () => {
  for (let y = 0; y < FIELD_HEIGHT; y++)
    for (let x = 0; x < FIELD_WIDTH; x++) field[y][x].mine = true;
};
const revealAll = () => {
  for (let y = 0; y < FIELD_HEIGHT; y++)
    for (let x = 0; x < FIELD_WIDTH; x++)
      field[y][x].mine = field[y][x].flag = false;
};
const resetGame = () => {
  field = getTwoDimensionalArray();
  setBombs();
  setMines();
  cursorX = cursorY = 0;
  explosion = clear = false;
  startTime = new Date();
};
const autoEraseMines = (_x, _y) => {
  if (
    _x < 0 ||
    _x >= FIELD_WIDTH ||
    _y < 0 ||
    _y >= FIELD_HEIGHT ||
    field[_y][_x].bomb ||
    getAdjacentBombsCount(_x, _y) > 0
  ) {
    return;
  }
  field[_y][_x].mine = false;
  findAdjacentNodes((x, y) => {
    let x2 = _x + x;
    let y2 = _y + y;
    if (x2 < 0 || x2 >= FIELD_WIDTH || y2 < 0 || y2 >= FIELD_HEIGHT) {
      return;
    }
    if (getAdjacentBombsCount(x2, y2) === 0 && field[y2][x2].mine) {
      field[y2][x2].mine = false;
      autoEraseMines(x2, y2);
    } else {
      field[y2][x2].mine = false;
    }
  });
};
const isCleared = () => {
  clear = true;
  for (let y = 0; y < FIELD_HEIGHT; y++)
    for (let x = 0; x < FIELD_WIDTH; x++)
      if (!field[y][x].bomb && field[y][x].mine) clear = false;
  if (clear) {
    beep();
    revealAll();
  }
};
document.body.addEventListener("keydown", (event) => {
  if (explosion || clear) {
    if (event.code === "KeyR") resetGame();
    return false;
  }
  switch (event.code) {
    case "KeyW":
      cursorY = cursorY - (cursorY > 0);
      break;
    case "KeyS":
      cursorY = cursorY + (cursorY < FIELD_HEIGHT - 1);
      break;
    case "KeyA":
      cursorX = cursorX - (cursorX > 0);
      break;
    case "KeyD":
      cursorX = cursorX + (cursorX < FIELD_WIDTH - 1);
      break;
    //case 'KeyB': field[cursorY][cursorX].bomb = !field[cursorY][cursorX].bomb; break;
    //case 'KeyM': field[cursorY][cursorX].mine = !field[cursorY][cursorX].mine; break;
    case "KeyF":
      field[cursorY][cursorX].flag = !field[cursorY][cursorX].flag;
      break;
    default:
      if (!field[cursorY][cursorX].mine) break;
      field[cursorY][cursorX].mine = false;
      if (field[cursorY][cursorX].bomb) {
        explosion = true;
        beep();
        revealAll();
      }
      isCleared();
      if (getAdjacentBombsCount(cursorX, cursorY) > 0) break;
      autoEraseMines(cursorX, cursorY);
      isCleared();
      break;
  }
});
const main = () => {
  drawField();
  if (!(explosion || clear)) displayTime();
};
const drawField = () => {
  let text = "";
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    for (let x = 0; x < FIELD_WIDTH; x++) {
      let char = "";
      if (cursorX == x && cursorY == y)
        if (!explosion) {
          char = clear ? "&#x1f389;" : "&#x26cf;";
        } else {
          char = "&#x1f4a5;";
        }
      else if (field[y][x].flag) char = "&#x1f6a9;";
      else if (field[y][x].mine) char = "&#x1f7eb;";
      else if (field[y][x].bomb) char = "&#x1f4a3;";
      else {
        let n = getAdjacentBombsCount(x, y);
        if (n === 0) char = `<span class='digit'>-</span>`;
        else char = `<span class='digit'>${n}</span>`; //
      }
      text += char;
    }
    text += "<br/>";
  }
  $("#world").innerHTML = text;
};
const displayTime = () => {
  let ms = new Date().getTime() - startTime.getTime();
  let s = Math.trunc(ms / 100) / 10;
  const nf = new Intl.NumberFormat("ja-JP", {
    useGrouping: false,
    minimumIntegerDigits: 1,
    minimumFractionDigits: 1
  });
  $("#time").innerHTML = `${nf.format(s)}`;
};
const beep = () => {
  const sound = new Audio(
    "data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="
  );
  sound.play();
};
resetGame();
setInterval("main()", 100); // 10fps
