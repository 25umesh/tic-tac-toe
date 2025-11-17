from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

WIN = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
]

def check_winner(board):
    for a,b,c in WIN:
        if board[a] == board[b] == board[c] and board[a] != " ":
            return board[a]
    return None

def is_draw(board):
    return all(c != " " for c in board)

def minimax(board, player, ai, human):
    winner = check_winner(board)
    if winner == ai:
        return {"score": 1}
    if winner == human:
        return {"score": -1}
    if is_draw(board):
        return {"score": 0}

    moves = []
    for i in range(9):
        if board[i] == " ":
            move = {"index": i}
            board[i] = player

            if player == ai:
                score = minimax(board, human, ai, human)["score"]
            else:
                score = minimax(board, ai, ai, human)["score"]

            move["score"] = score
            board[i] = " "
            moves.append(move)

    if player == ai:
        best = max(moves, key=lambda m: m["score"])
    else:
        best = min(moves, key=lambda m: m["score"])

    return best

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/ai_move", methods=["POST"])
def ai_move():
    data = request.get_json()
    board = data["board"]
    ai = data["ai"]
    human = "o" if ai == "x" else "x"

    if check_winner(board) or is_draw(board):
        return jsonify({"move": None})

    best = minimax(board, ai, ai, human)
    return jsonify({"move": best["index"]})

if __name__ == "__main__":
    app.run(debug=True)
