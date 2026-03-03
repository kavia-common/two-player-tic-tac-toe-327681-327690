import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

/**
 * Helpers to interact with the board via accessible names.
 * The app labels squares as: "Square row {row} column {col}, empty|X|O"
 */
function getSquare(row, col, state = "empty") {
  return screen.getByRole("gridcell", {
    name: new RegExp(`Square row ${row} column ${col}, ${state}`, "i"),
  });
}

function getStatus() {
  return screen.getByRole("status");
}

describe("Tic-Tac-Toe gameplay", () => {
  test("turn-taking: X starts, then O, and overwriting a taken square is not allowed", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(getStatus()).toHaveTextContent("Next player: X");

    // X plays top-left
    await user.click(getSquare(1, 1, "empty"));
    expect(getStatus()).toHaveTextContent("Next player: O");

    // The clicked square should now show X and be disabled.
    const xSquare = getSquare(1, 1, "X");
    expect(xSquare).toBeDisabled();

    // Try to click again (should not change turn back).
    await user.click(xSquare);
    expect(getStatus()).toHaveTextContent("Next player: O");

    // O plays top-middle
    await user.click(getSquare(1, 2, "empty"));
    expect(getStatus()).toHaveTextContent("Next player: X");

    // Verify O was placed.
    expect(getSquare(1, 2, "O")).toBeDisabled();
  });

  test("win detection: X wins on the top row and the game locks until restart", async () => {
    const user = userEvent.setup();
    render(<App />);

    // X: (1,1)
    await user.click(getSquare(1, 1, "empty"));
    // O: (2,1)
    await user.click(getSquare(2, 1, "empty"));
    // X: (1,2)
    await user.click(getSquare(1, 2, "empty"));
    // O: (2,2)
    await user.click(getSquare(2, 2, "empty"));
    // X: (1,3) -> win
    await user.click(getSquare(1, 3, "empty"));

    expect(getStatus()).toHaveTextContent("Winner: X");

    // Board should be disabled / game over; remaining empty squares should be disabled.
    const board = screen.getByRole("grid", { name: /3 by 3 tic tac toe board/i });
    expect(board).toHaveAttribute("aria-disabled", "true");

    // Spot check an unplayed square is disabled after win.
    expect(getSquare(3, 3, "empty")).toBeDisabled();

    // Clicking should not change status.
    await user.click(getSquare(3, 3, "empty"));
    expect(getStatus()).toHaveTextContent("Winner: X");
  });

  test("draw detection: fills the board without a winner and shows Draw!", async () => {
    const user = userEvent.setup();
    render(<App />);

    /**
     * Draw sequence (row-major indices):
     * X O X
     * X O O
     * O X X
     *
     * Moves:
     * X: (1,1)
     * O: (1,2)
     * X: (1,3)
     * O: (2,2)
     * X: (2,1)
     * O: (2,3)
     * X: (3,2)
     * O: (3,1)
     * X: (3,3)
     */
    await user.click(getSquare(1, 1, "empty")); // X
    await user.click(getSquare(1, 2, "empty")); // O
    await user.click(getSquare(1, 3, "empty")); // X
    await user.click(getSquare(2, 2, "empty")); // O
    await user.click(getSquare(2, 1, "empty")); // X
    await user.click(getSquare(2, 3, "empty")); // O
    await user.click(getSquare(3, 2, "empty")); // X
    await user.click(getSquare(3, 1, "empty")); // O
    await user.click(getSquare(3, 3, "empty")); // X

    expect(getStatus()).toHaveTextContent(/^Draw!$/);

    // Ensure all cells are disabled at game over (either due to draw or filled).
    const cells = screen.getAllByRole("gridcell");
    expect(cells).toHaveLength(9);
    for (const cell of cells) {
      expect(cell).toBeDisabled();
    }
  });

  test("restart behavior: clears the board, resets status to X, and re-enables squares", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Play a couple moves
    await user.click(getSquare(1, 1, "empty")); // X
    await user.click(getSquare(1, 2, "empty")); // O
    expect(getStatus()).toHaveTextContent("Next player: X");

    // Restart
    await user.click(screen.getByRole("button", { name: /restart/i }));

    // Status reset
    expect(getStatus()).toHaveTextContent("Next player: X");

    // All squares empty & enabled
    const board = screen.getByRole("grid", { name: /3 by 3 tic tac toe board/i });
    expect(board).toHaveAttribute("aria-disabled", "false");

    const cells = within(board).getAllByRole("gridcell");
    expect(cells).toHaveLength(9);
    for (let r = 1; r <= 3; r += 1) {
      for (let c = 1; c <= 3; c += 1) {
        expect(getSquare(r, c, "empty")).toBeEnabled();
      }
    }
  });
});
