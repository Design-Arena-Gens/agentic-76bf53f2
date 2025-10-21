"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Player = "X" | "O";
type CellValue = Player | null;

type Scores = {
  X: number;
  O: number;
  draws: number;
};

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

const createEmptyBoard = (): CellValue[] =>
  Array.from({ length: 9 }, () => null as CellValue);

function evaluateBoard(board: CellValue[]) {
  for (const [a, b, c] of winningLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        player: board[a],
        line: [a, b, c] as typeof winningLines[number],
      };
    }
  }

  return null;
}

export default function Home() {
  const [board, setBoard] = useState<CellValue[]>(() => createEmptyBoard());
  const [isXNext, setIsXNext] = useState(true);
  const [round, setRound] = useState(1);
  const [startingPlayer, setStartingPlayer] = useState<Player>("X");
  const [scores, setScores] = useState<Scores>({ X: 0, O: 0, draws: 0 });
  const [roundFinished, setRoundFinished] = useState(false);

  const result = useMemo(() => evaluateBoard(board), [board]);
  const winner = result?.player ?? null;
  const winningLine: number[] | null = result?.line ? [...result.line] : null;

  const movesPlayed = useMemo(
    () => board.filter((cell) => cell !== null).length,
    [board],
  );
  const isDraw = !winner && movesPlayed === board.length;

  useEffect(() => {
    if ((winner || isDraw) && !roundFinished) {
      setRoundFinished(true);
      setScores((prev) => {
        if (winner) {
          return { ...prev, [winner]: prev[winner] + 1 };
        }
        return { ...prev, draws: prev.draws + 1 };
      });
    }

    if (!winner && !isDraw && roundFinished) {
      setRoundFinished(false);
    }
  }, [winner, isDraw, roundFinished]);

  const statusMessage = useMemo(() => {
    if (winner) {
      return `Player ${winner} wins this round!`;
    }
    if (isDraw) {
      return "It's a draw!";
    }
    return `Player ${isXNext ? "X" : "O"} — your move`;
  }, [winner, isDraw, isXNext]);

  const handleSquareClick = (index: number) => {
    if (board[index] || winner || isDraw) {
      return;
    }

    setBoard((prev) => {
      const nextBoard = [...prev];
      nextBoard[index] = isXNext ? "X" : "O";
      return nextBoard;
    });
    setIsXNext((prev) => !prev);
  };

  const handleNextRound = () => {
    if (!winner && !isDraw) {
      return;
    }

    const nextStarter: Player = startingPlayer === "X" ? "O" : "X";

    setBoard(createEmptyBoard());
    setIsXNext(nextStarter === "X");
    setStartingPlayer(nextStarter);
    setRound((prev) => prev + 1);
    setRoundFinished(false);
  };

  const handleResetMatch = () => {
    setBoard(createEmptyBoard());
    setIsXNext(true);
    setStartingPlayer("X");
    setRound(1);
    setScores({ X: 0, O: 0, draws: 0 });
    setRoundFinished(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-accent/10 to-background p-6">
      <Card className="w-full max-w-xl">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-3xl font-bold">Tic Tac Toe Arena</CardTitle>
          <CardDescription>
            A polished, responsive experience powered by Next.js and shadcn/ui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section className="grid gap-4 rounded-lg border bg-muted/30 p-4 text-center md:grid-cols-3">
            <div>
              <p className="text-sm uppercase text-muted-foreground">Round</p>
              <p className="text-3xl font-bold">{round}</p>
            </div>
            <div>
              <p className="text-sm uppercase text-muted-foreground">Next move</p>
              <p className="text-3xl font-bold">{winner ? "—" : isXNext ? "X" : "O"}</p>
            </div>
            <div>
              <p className="text-sm uppercase text-muted-foreground">Opening player</p>
              <p className="text-3xl font-bold">{startingPlayer}</p>
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-lg font-medium text-muted-foreground">{statusMessage}</p>
            <div className="grid grid-cols-3 gap-3">
              {board.map((cell, index) => {
                const isWinningSquare = winningLine?.includes(index) ?? false;
                return (
                  <Button
                    key={index}
                    variant={isWinningSquare ? "default" : "outline"}
                    className={cn(
                      "aspect-square w-full text-4xl font-semibold transition-transform duration-150 ease-out",
                      "md:text-5xl",
                      isWinningSquare && "shadow-lg",
                      !cell && !winner && !isDraw && "hover:scale-[1.02]",
                    )}
                    onClick={() => handleSquareClick(index)}
                  >
                    {cell ?? ""}
                  </Button>
                );
              })}
            </div>
          </section>

          <section className="grid gap-4 rounded-lg border bg-muted/20 p-4 md:grid-cols-3">
            <div className="rounded-lg bg-background/80 p-4 shadow-sm">
              <p className="text-sm uppercase text-muted-foreground">Player X</p>
              <p className="text-2xl font-semibold">{scores.X}</p>
            </div>
            <div className="rounded-lg bg-background/80 p-4 shadow-sm">
              <p className="text-sm uppercase text-muted-foreground">Draws</p>
              <p className="text-2xl font-semibold">{scores.draws}</p>
            </div>
            <div className="rounded-lg bg-background/80 p-4 shadow-sm">
              <p className="text-sm uppercase text-muted-foreground">Player O</p>
              <p className="text-2xl font-semibold">{scores.O}</p>
            </div>
          </section>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 md:flex-row md:justify-between">
          <Button
            variant="secondary"
            onClick={handleNextRound}
            disabled={!winner && !isDraw}
          >
            Start next round
          </Button>
          <Button variant="ghost" onClick={handleResetMatch}>
            Reset match
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
