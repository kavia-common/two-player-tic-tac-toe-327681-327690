import React, { useMemo, useState } from "react";
import "./App.css";

const PLAYER_X = "X";
const PLAYER_O = "O";

/**
 * Returns the winner ("X" | "O") if there is one, otherwise null.
 * @param {Array<("X"|"O"|null)>} squares
 * @returns {"X"|"O"|null}
 */
function calculateWinner(squares) {
  const lines = [
    // rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // cols
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) return v;
  }
  return null;
}

/**
 * Returns true if all squares are filled and there is no winner.
 * @param {Array<("X"|"O"|null)>} squares
 * @returns {boolean}
 */
function isDraw(squares) {
  return squares.every(Boolean) && !calculateWinner(squares);
}

// PUBLIC_INTERFACE
function App() {
  /** Board squares, indexed 0..8 (row-major). */
  const [squares, setSquares] = useState(Array(9).fill(null));
  /** Track whose turn it is: X starts. */
  const [xIsNext, setXIsNext] = useState(true);

  const winner = useMemo(() => calculateWinner(squares), [squares]);
  const draw = useMemo(() => isDraw(squares), [squares]);
  const gameOver = Boolean(winner) || draw;

  const currentPlayer = xIsNext ? PLAYER_X : PLAYER_O;

  const statusText = useMemo(() => {
    if (winner) return `Winner: ${winner}`;
    if (draw) return "Draw!";
    return `Next player: ${currentPlayer}`;
  }, [winner, draw, currentPlayer]);

  // PUBLIC_INTERFACE
  function handleSquareClick(index) {
    // Ignore clicks if game is over or square already taken.
    if (gameOver || squares[index]) return;

    setSquares((prev) => {
      const next = prev.slice();
      next[index] = currentPlayer;
      return next;
    });
    setXIsNext((prev) => !prev);
  }

  // PUBLIC_INTERFACE
  function restartGame() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }

  return (
    <div className="App">
      <main className="ttt-page">
        <section className="ttt-card" aria-label="Tic Tac Toe game">
          <header className="ttt-header">
            <h1 className="ttt-title">Tic‑Tac‑Toe</h1>
            <p className="ttt-subtitle">Two players, one device.</p>
          </header>

          <div
            className="ttt-status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-over={gameOver ? "true" : "false"}
          >
            {statusText}
          </div>

          <div
            className="ttt-board"
            role="grid"
            aria-label="3 by 3 Tic Tac Toe board"
            aria-disabled={gameOver ? "true" : "false"}
          >
            {squares.map((value, idx) => {
              const row = Math.floor(idx / 3) + 1;
              const col = (idx % 3) + 1;
              const label = value
                ? `Square row ${row} column ${col}, ${value}`
                : `Square row ${row} column ${col}, empty`;

              return (
                <button
                  key={idx}
                  type="button"
                  className="ttt-square"
                  onClick={() => handleSquareClick(idx)}
                  disabled={gameOver || Boolean(value)}
                  aria-label={label}
                  role="gridcell"
                >
                  <span
                    className={`ttt-mark ${
                      value === PLAYER_X
                        ? "ttt-mark-x"
                        : value === PLAYER_O
                          ? "ttt-mark-o"
                          : ""
                    }`}
                    aria-hidden="true"
                  >
                    {value}
                  </span>
                </button>
              );
            })}
          </div>

          <footer className="ttt-footer">
            <button
              type="button"
              className="ttt-restart"
              onClick={restartGame}
            >
              Restart
            </button>

            <p className="ttt-hint">
              {gameOver
                ? "Game over — restart to play again."
                : "Tip: You can’t overwrite a square."}
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
