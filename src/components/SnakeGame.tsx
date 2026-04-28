import React, { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 22;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 100; // ms

function generateFood(snake: { x: number, y: number }[]) {
  while (true) {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    const isOccupied = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    if (!isOccupied) return newFood;
  }
}

export function SnakeGame({ onScoreChange }: { onScoreChange: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const directionRef = useRef(direction);
  // Keep track of the direction the snake is actually moving this tick
  // to prevent reverse-turning in high speed inputs
  const currentMoveDirRef = useRef(direction);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    currentMoveDirRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
  };

  useEffect(() => {
    onScoreChange(score);
  }, [score, onScoreChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (!isPlaying && !gameOver && e.key === ' ') {
         startGame();
         return;
      }
      if (gameOver && e.key === ' ') {
         startGame();
         return;
      }

      const dir = currentMoveDirRef.current;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (dir.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (dir.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (dir.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (dir.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying) return;

    const moveSnake = () => {
      setSnake(prev => {
        const head = prev[0];
        const requestedDir = directionRef.current;
        currentMoveDirRef.current = requestedDir; // Locks in the direction for this tick

        const newHead = {
          x: head.x + requestedDir.x,
          y: head.y + requestedDir.y
        };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setIsPlaying(false);
          setGameOver(true);
          return prev;
        }

        // Self collision
        if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setIsPlaying(false);
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Food collision
        let eaten = false;
        setFood(currentFood => {
          if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
            eaten = true;
            setScore(s => s + 10);
            return generateFood(newSnake);
          }
          return currentFood;
        });

        if (!eaten) {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(intervalId);
  }, [isPlaying]);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background (to transparent so background grid shows through, or solid matching design)
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
       ctx.beginPath();
       ctx.moveTo(i * CELL_SIZE, 0);
       ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
       ctx.stroke();
       ctx.beginPath();
       ctx.moveTo(0, i * CELL_SIZE);
       ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
       ctx.stroke();
    }

    // Draw Food
    ctx.fillStyle = '#ff00ff'; // neon magenta
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    // Rounded food cell like the design
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      (CELL_SIZE - 6) / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw Snake
    ctx.shadowBlur = 8;
    snake.forEach((segment, index) => {
      // Glow and color cyan
      ctx.fillStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      
      const padding = 1;
      ctx.fillRect(
        segment.x * CELL_SIZE + padding, 
        segment.y * CELL_SIZE + padding, 
        CELL_SIZE - padding * 2, 
        CELL_SIZE - padding * 2
      );
    });

    // Reset shadow for overlays
    ctx.shadowBlur = 0;

    // Overlay texts
    if (!isPlaying && !gameOver) {
       ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
       ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
       
       ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
       ctx.font = '14px "Courier New", Courier, monospace';
       ctx.textAlign = 'center';
       ctx.letterSpacing = '10px';
       ctx.fillText('PRESS SPACE TO START', CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    } else if (gameOver) {
       ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
       ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
       
       ctx.fillStyle = '#ff00ff';
       ctx.font = 'bold 36px "Helvetica Neue", Arial, sans-serif';
       ctx.textAlign = 'center';
       ctx.shadowColor = '#ff00ff';
       ctx.shadowBlur = 15;
       ctx.fillText('GAME OVER', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 20);
       
       ctx.fillStyle = '#00f3ff';
       ctx.font = 'bold 18px "Courier New", Courier, monospace';
       ctx.shadowColor = '#00f3ff';
       ctx.shadowBlur = 8;
       ctx.fillText('SPACE TO RESTART', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 25);
    }

  }, [snake, food, isPlaying, gameOver]);

  return (
    <div className="relative inline-block w-full h-full max-w-[440px] max-h-[440px] aspect-square rounded overflow-hidden">
      <canvas 
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="block bg-transparent w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
