import {useState, useEffect, useCallback, useRef} from "react";
import "./App.css";

function App() {
  const [targetWord, setTargetWord] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [letterStatus, setLetterStatus] = useState<
    Record<string, "correct" | "present" | "absent">
  >({});
  const [flippedLetters, setFlippedLetters] = useState<Set<string>>(new Set());
  const MAX_GUESSES = 6;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const keyboardRows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["Enter", "z", "x", "c", "v", "b", "n", "m", "Backspace"],
  ];

  const fetchWord = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/random-word");
      const data = await response.json();
      setTargetWord(data.word.toLowerCase());
      setGuesses([]);
      setCurrentGuess("");
      setGameStatus("playing");
      setError("");
      setLetterStatus({});
    } catch (error) {
      setError("Failed to fetch word. Please try again.");
      console.error("Error fetching word:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWord();
  }, []);

  useEffect(() => {
    audioRef.current = new Audio("/celebration.mp3");
  }, []);

  const validateWord = useCallback(async (word: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/validate-word/${word}`
      );
      const data = await response.json();
      return data.isValid;
    } catch (error) {
      console.error("Error validating word:", error);
      return false;
    }
  }, []);

  const submitGuess = useCallback(async () => {
    const isValid = await validateWord(currentGuess);
    if (!isValid) {
      setError("Not a valid word");
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setError("");

    // Update letter statuses and trigger flip animation
    const newLetterStatus = {...letterStatus};
    const newFlippedLetters = new Set(flippedLetters);
    const matchedIndices = new Set<number>();
    const presentLetters = new Map<string, number>();

    // First pass: mark correct letters
    currentGuess.split("").forEach((letter, index) => {
      if (letter === targetWord[index]) {
        newLetterStatus[letter] = "correct";
        matchedIndices.add(index);
        presentLetters.set(letter, (presentLetters.get(letter) || 0) + 1);
      }
    });

    // Second pass: mark present letters (only for unmatched positions)
    currentGuess.split("").forEach((letter, index) => {
      if (!matchedIndices.has(index)) {
        const targetCount = targetWord
          .split("")
          .filter((l) => l === letter).length;
        const currentCount = presentLetters.get(letter) || 0;

        if (
          targetWord.includes(letter) &&
          currentCount < targetCount &&
          newLetterStatus[letter] !== "correct"
        ) {
          newLetterStatus[letter] = "present";
          presentLetters.set(letter, currentCount + 1);
        } else if (!newLetterStatus[letter]) {
          newLetterStatus[letter] = "absent";
        }
      }
      newFlippedLetters.add(`${newGuesses.length - 1}-${index}`);
    });

    setLetterStatus(newLetterStatus);
    setFlippedLetters(newFlippedLetters);

    setCurrentGuess("");

    if (currentGuess === targetWord) {
      setGameStatus("won");
      audioRef.current
        ?.play()
        .catch((error) => console.error("Error playing sound:", error));
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameStatus("lost");
    }
  }, [
    currentGuess,
    targetWord,
    guesses,
    letterStatus,
    validateWord,
    flippedLetters,
  ]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (gameStatus !== "playing") return;

      if (e.key === "Enter" && currentGuess.length === 5) {
        submitGuess();
      } else if (e.key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (currentGuess.length < 5 && /^[a-zA-Z]$/.test(e.key)) {
        setCurrentGuess((prev) => prev + e.key.toLowerCase());
      }
    },
    [currentGuess, gameStatus, submitGuess]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const getLetterStatus = (letter: string, index: number) => {
    if (letter === targetWord[index]) return "correct";
    if (targetWord.includes(letter)) return "present";
    return "absent";
  };

  const emptyRows = Array(
    Math.max(
      0,
      MAX_GUESSES - guesses.length - (gameStatus === "playing" ? 1 : 0)
    )
  )
    .fill(null)
    .map((_, i) => (
      <div key={i} className="guess-row">
        {Array(5)
          .fill(null)
          .map((_, j) => (
            <div key={j} className="letter"></div>
          ))}
      </div>
    ));

  return (
    <div className="App">
      <h1>Wordle Clone</h1>
      {error && <div className="error">{error}</div>}
      <div className="game-container">
        <div className="game-board">
          {guesses.map((guess, i) => (
            <div key={i} className="guess-row">
              {guess.split("").map((letter, j) => (
                <div
                  key={j}
                  className={`letter ${getLetterStatus(letter, j)} ${
                    flippedLetters.has(`${i}-${j}`) ? "flip" : ""
                  }`}
                  style={
                    {
                      "--delay": `${j * 0.1}s`,
                    } as React.CSSProperties
                  }
                >
                  {letter}
                </div>
              ))}
            </div>
          ))}
          {gameStatus === "playing" && (
            <div className="guess-row current">
              {currentGuess
                .padEnd(5, " ")
                .split("")
                .map((letter, i) => (
                  <div key={i} className="letter">
                    {letter === " " ? "" : letter}
                  </div>
                ))}
            </div>
          )}
          {emptyRows}
        </div>
        <div className="keyboard">
          {keyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="keyboard-row">
              {row.map((key) => (
                <div
                  key={key}
                  className={`key ${letterStatus[key] || ""} ${
                    key.length > 1 ? "special" : ""
                  }`}
                >
                  {key}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {gameStatus !== "playing" && (
        <div className="game-over">
          <h2>{gameStatus === "won" ? "You won!" : "Game Over!"}</h2>
          {gameStatus === "lost" && <p>The word was: {targetWord}</p>}
          <button onClick={fetchWord} disabled={loading}>
            {loading ? "Loading..." : "Play Again"}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
