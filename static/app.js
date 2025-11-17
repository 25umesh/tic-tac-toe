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

    // Compute AI move locally (no server on GitHub Pages)
    const move = getBestMove(board, ai, human);
    if (move !== null) board[move] = ai;

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
            statusEl.textContent = "AI thinking...";
            const move = getBestMove(board, ai, human);
            if (move !== null) board[move] = ai;
            current = human;
            render();
            statusEl.textContent = "Turn: " + current;
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

// ---------- Local AI (Minimax) implementation ----------
function minimaxJS(b, player, aiP, humanP) {
    const winner = checkWinner(b);
    if (winner === aiP) return { score: 1 };
    if (winner === humanP) return { score: -1 };
    if (isDraw(b)) return { score: 0 };

    const moves = [];
    for (let i = 0; i < 9; i++) {
        if (b[i] === " ") {
            const move = { index: i };
            b[i] = player;
            let result;
            if (player === aiP) result = minimaxJS(b, humanP, aiP, humanP);
            else result = minimaxJS(b, aiP, aiP, humanP);
            move.score = result.score;
            b[i] = " ";
            moves.push(move);
        }
    }

    if (player === aiP) {
        let best = moves[0];
        for (const m of moves) if (m.score > best.score) best = m;
        return best;
    } else {
        let best = moves[0];
        for (const m of moves) if (m.score < best.score) best = m;
        return best;
    }
}

function getBestMove(b, aiP, humanP) {
    if (checkWinner(b) || isDraw(b)) return null;
    const best = minimaxJS(b.slice(), aiP, aiP, humanP); // slice to avoid external mutation
    return best.index ?? null;
}
