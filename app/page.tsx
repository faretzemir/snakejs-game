"use client";

import { useState, useEffect } from "react";

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = null;

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState<{x: number, y: number} | null>(null);
  const [direction, setDirection] = useState<{ x: number; y: number } | null>(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);

  // Initialize food when component mounts on client side only
  useEffect(() => {
    setFood(randomFood(INITIAL_SNAKE));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e:KeyboardEvent) => {
      if (!isGameStarted) {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
          setIsGameStarted(true);
          if (e.key === "ArrowUp" || e.key === "w") setDirection({ x: 0, y: -1 });
          if (e.key === "ArrowDown" || e.key === "s") setDirection({ x: 0, y: 1 });
          if (e.key === "ArrowLeft" || e.key === "a") setDirection({ x: -1, y: 0 });
          if (e.key === "ArrowRight" || e.key === "d") setDirection({ x: 1, y: 0 });
        }
        return;
      }
      if ((e.key === "ArrowUp" || e.key === "w") && direction?.y === 0) setDirection({ x: 0, y: -1 });
      if ((e.key === "ArrowDown" || e.key === "s") && direction?.y === 0) setDirection({ x: 0, y: 1 });
      if ((e.key === "ArrowLeft" || e.key === "a") && direction?.x === 0) setDirection({ x: -1, y: 0 });
      if ((e.key === "ArrowRight" || e.key === "d") && direction?.x === 0) setDirection({ x: 1, y: 0 });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, isGameStarted]);

  const handleDirectionChange = (newDirection: { x: number; y: number }) => {
    if (!isGameStarted) {
      setIsGameStarted(true);
      setDirection(newDirection);
      return;
    }
    
    // only allow perpendicular mvmt (prevent 180° turns)
    if (
      (newDirection.x !== 0 && direction?.x === 0) || 
      (newDirection.y !== 0 && direction?.y === 0)
    ) {
      setDirection(newDirection);
    }
  };

  useEffect(() => {
    if (!isGameStarted || isGameOver || direction === null || !food) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const newHead: { x: number; y: number } = {
          x: prevSnake[0].x + direction.x,
          y: prevSnake[0].y + direction.y,
        };
    
        if (isCollision(newHead, prevSnake)) {
          setIsGameOver(true);
          return prevSnake; // return previous snake if collision occurs
        }
    
        const newSnake = [newHead, ...prevSnake]; // add new head to snake
    
        // Check if the snake has eaten the food
        if (food && newHead.x === food.x && newHead.y === food.y) {
          setFood(randomFood(newSnake)); // gen new food using new snake state
          return newSnake; // eeturn newSnake to grow the snake immediately
        }
    
        // if food not yet eaten, remove the tail
        newSnake.pop(); 
        return newSnake; // return updated snake
      });
    }, 200);

    return () => clearInterval(interval);
  }, [direction, food, isGameStarted, isGameOver]);

  function randomFood(currentSnake: {x: number, y: number}[]) {
    let newFood: { x: number; y: number };
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }

  function isCollision(head: { x: number; y: number }, body: { x: number; y: number }[]) {
    return (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= GRID_SIZE ||
      head.y >= GRID_SIZE ||
      body.some((segment: { x: number; y: number }) => segment.x === head.x && segment.y === head.y)
    );
  }

  function resetGame() {
    setSnake(INITIAL_SNAKE);
    setFood(randomFood(INITIAL_SNAKE));
    setDirection(INITIAL_DIRECTION);
    setIsGameOver(false);
    setIsGameStarted(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl mb-4">Snake Game</h1>
      <p> Green is snake, red is apple.</p>
      {!isGameStarted && <p className="mb-4">Press an arrow key to start</p>}
      {isGameOver && <button onClick={resetGame} className="bg-red-500 p-2 rounded">Restart</button>}
      <div
        className="grid border-2 border-gray-700"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`, width: GRID_SIZE * 20 }}
      >
        {[...Array(GRID_SIZE)].map((_, y) =>
          [...Array(GRID_SIZE)].map((_, x) => {
            const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
            const isFood = food && food.x === x && food.y === y;
            return (
              <div
                key={`${x}-${y}`}
                className={`w-5 h-5 ${isSnake ? "bg-green-500" : isFood ? "bg-red-500" : "bg-gray-800"}`}
              />
            );
          })
        )}
      </div>

      {/* Mobile touch controls */}
      <div className="w-48 mb-4 select-none">
        {/* Up arrow */}
        <div className="flex justify-center mb-2">
          <button 
            className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center text-2xl touch-manipulation"
            onClick={() => handleDirectionChange({ x: 0, y: -1 })}
          >
            ↑
          </button>
        </div>
        
        {/* Left, Down, Right arrows in a row */}
        <div className="flex justify-between">
          <button 
            className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center text-2xl touch-manipulation"
            onClick={() => handleDirectionChange({ x: -1, y: 0 })}
          >
            ←
          </button>
          <button 
            className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center text-2xl touch-manipulation"
            onClick={() => handleDirectionChange({ x: 0, y: 1 })}
          >
            ↓
          </button>
          <button 
            className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center text-2xl touch-manipulation"
            onClick={() => handleDirectionChange({ x: 1, y: 0 })}
          >
            →
          </button>
        </div>
      </div>

    </div>
  );
}