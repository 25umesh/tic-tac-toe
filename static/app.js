const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const modeEl = document.getElementById("mode");
const symbolEl = document.getElementById("playerSymbol");

let board = Array(9).fill(" ");
let current = "x";
let human = "x";
let ai = "o";
let gameOver = false;
let mode = "single";

function buildBoard() {
    boardEl.innerHTML = "";
    for (let i = 0; i < 9; i++) {
        let cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.index = i;
        cell.onclick = onClick;
        boardEl.appendChild(cell);
    }
}

function render() {
    document.querySelectorAll(".cell").forEach((c, i) => {
        c.textContent = board[i] === " " ? "" : board[i];
        if (board[i] !== " " || gameOver)
            c.classList.add("disabled");
        else c.classList.remove("disabled");
    });
}

function checkWinner(b) {
    const win = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (const [a,b1,c] of win) {
        if (b[a] !== " " && b[a] === b[b1] && b[a] === b[c])
            return b[a];
    }
    return null;
}

function isDraw(b) {
    return b.every(x => x !== " ");
}

async function onClick(e) {
    if (gameOver) return;

    const idx = e.target.dataset.index;
    if (board[idx] !== " ") return;

    if (mode === "local") {
        board[idx] = current;
        let w = checkWinner(board);
        if (w) { statusEl.textContent = w + " wins!"; gameOver = true; }
        else if (isDraw(board)) { statusEl.textContent = "Draw!"; gameOver = true; }
        else {
            current = current === "x" ? "o" : "x";
            statusEl.textContent = "Turn: " + current;
        }
        render();
        return;
    }

    if (current !== human) return;

    board[idx] = human;
    render();

    let w = checkWinner(board);
    if (w) { statusEl.textContent = w + " wins!"; gameOver = true; return; }
    if (isDraw(board)) { statusEl.textContent = "Draw!"; gameOver = true; return; }

    current = ai;
    statusEl.textContent = "AI thinking...";

    let res = await fetch("/ai_move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board, ai })
    });

    let data = await res.json();
    if (data.move !== null) board[data.move] = ai;

    w = checkWinner(board);
    if (w) { statusEl.textContent = w + " wins!"; gameOver = true; }
    else if (isDraw(board)) { statusEl.textContent = "Draw!"; gameOver = true; }
    else {
        current = human;
        statusEl.textContent = "Turn: " + current;
    }
    render();
}

function start() {
    board = Array(9).fill(" ");
    gameOver = false;

    mode = modeEl.value;
    human = symbolEl.value;
    ai = human === "x" ? "o" : "x";
    current = "x";

    if (mode === "single") {
        if (human === "o") {
            current = ai;
            (async () => {
                statusEl.textContent = "AI thinking...";
                let res = await fetch("/ai_move", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ board, ai })
                });
                let data = await res.json();
                board[data.move] = ai;
                current = human;
                render();
                statusEl.textContent = "Turn: " + current;
            })();
        } else {
            statusEl.textContent = "Turn: " + human;
        }
    } else {
        statusEl.textContent = "Turn: x";
    }

    render();
}

startBtn.onclick = start;

buildBoard();
render();
statusEl.textContent = "Press Start";
