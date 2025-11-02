import { useState, useEffect, useRef, useCallback } from 'react'
import soundPlayer from '../../../utils/sounds'
import { isTouchDevice } from '../../../utils/deviceDetection'
import './Snake.css'

const FOODS = ['🍎', '🍌', '🍇', '🍊', '🍓', '🥝', '🍉', '🍒']
const GRID_SIZE = 20

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  easy: {
    speed: 120, // ms per move - faster
    startLength: 3,
    scoreMultiplier: 1
  },
  medium: {
    speed: 80,
    startLength: 5,
    scoreMultiplier: 2
  },
  hard: {
    speed: 50,
    startLength: 7,
    scoreMultiplier: 3
  }
}

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
}

function Snake({ difficulty = 'easy', onBackToHub }) {
  const [snake, setSnake] = useState([])
  const [food, setFood] = useState({ x: 10, y: 10, emoji: '🍎' })
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT)
  const [nextDirection, setNextDirection] = useState(DIRECTIONS.RIGHT)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  const config = DIFFICULTY_CONFIG[difficulty]
  const gameLoopRef = useRef(null)
  const touchStartRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = setInterval(() => {
        moveSnake()
      }, config.speed)

      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      }
    }
  }, [gameStarted, gameOver, snake, direction, nextDirection, config.speed])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const handleKeyPress = (e) => {
      // Prevent default only for arrow keys
      if (e.key.startsWith('Arrow')) {
        e.preventDefault()
      }
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y === 0) setNextDirection(DIRECTIONS.UP)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y === 0) setNextDirection(DIRECTIONS.DOWN)
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x === 0) setNextDirection(DIRECTIONS.LEFT)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x === 0) setNextDirection(DIRECTIONS.RIGHT)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, gameOver, direction])

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (!gameStarted || gameOver) return
    
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 30 && direction.x === 0) {
        setNextDirection(DIRECTIONS.RIGHT)
      } else if (deltaX < -30 && direction.x === 0) {
        setNextDirection(DIRECTIONS.LEFT)
      }
    } else {
      // Vertical swipe
      if (deltaY > 30 && direction.y === 0) {
        setNextDirection(DIRECTIONS.DOWN)
      } else if (deltaY < -30 && direction.y === 0) {
        setNextDirection(DIRECTIONS.UP)
      }
    }
  }, [gameStarted, gameOver, direction])

  const startGame = () => {
    const initialSnake = []
    for (let i = 0; i < config.startLength; i++) {
      initialSnake.push({ x: 10 - i, y: 10 })
    }
    
    setSnake(initialSnake)
    setDirection(DIRECTIONS.RIGHT)
    setNextDirection(DIRECTIONS.RIGHT)
    setScore(0)
    setGameStarted(true)
    setGameOver(false)
    generateFood(initialSnake)
    soundPlayer.playClick()
  }

  const generateFood = (currentSnake) => {
    let newFood
    let validPosition = false
    
    while (!validPosition) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        emoji: FOODS[Math.floor(Math.random() * FOODS.length)]
      }
      
      validPosition = !currentSnake.some(segment => 
        segment.x === newFood.x && segment.y === newFood.y
      )
    }
    
    setFood(newFood)
  }

  const moveSnake = () => {
    setSnake(prevSnake => {
      if (prevSnake.length === 0) return prevSnake

      setDirection(nextDirection)
      
      const head = prevSnake[0]
      const newHead = {
        x: head.x + nextDirection.x,
        y: head.y + nextDirection.y
      }

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || 
          newHead.y < 0 || newHead.y >= GRID_SIZE) {
        endGame()
        return prevSnake
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        endGame()
        return prevSnake
      }

      const newSnake = [newHead, ...prevSnake]

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + config.scoreMultiplier)
        soundPlayer.playMatch()
        generateFood(newSnake)
        return newSnake // Don't remove tail, snake grows
      }

      newSnake.pop() // Remove tail if no food eaten
      return newSnake
    })
  }

  const endGame = () => {
    setGameOver(true)
    setGameStarted(false)
    if (score > highScore) {
      setHighScore(score)
      soundPlayer.playWin()
    } else {
      soundPlayer.playNoMatch()
    }
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    soundPlayer.enabled = !soundEnabled
  }

  const renderGrid = () => {
    const grid = []
    const snakePositions = new Map()
    
    // Create lookup map for fast access
    snake.forEach((segment, index) => {
      snakePositions.set(`${segment.x}-${segment.y}`, index)
    })
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const posKey = `${x}-${y}`
        const snakeIndex = snakePositions.get(posKey)
        const isSnake = snakeIndex !== undefined
        const isSnakeHead = isSnake && snakeIndex === 0
        const isFood = food.x === x && food.y === y
        
        let cellClass = 'grid-cell'
        if (isSnakeHead) cellClass += ' snake-head'
        else if (isSnake) cellClass += ' snake-body'
        
        grid.push(
          <div key={posKey} className={cellClass}>
            {isFood && <div className="food-item">{food.emoji}</div>}
          </div>
        )
      }
    }
    return grid
  }

  return (
    <div 
      className="snake-game"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="snake-header">
        <button className="back-button" onClick={onBackToHub}>
          ← Back
        </button>
        <h1 className="snake-title">Snake Game</h1>
        <button className="sound-toggle" onClick={toggleSound}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <div className="snake-stats">
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Length:</span>
          <span className="stat-value">{snake.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">High Score:</span>
          <span className="stat-value">{highScore}</span>
        </div>
      </div>

      <div className="game-board">
        {renderGrid()}
      </div>

      {isTouchDevice() && gameStarted && !gameOver && (
        <div className="touch-controls">
          <div className="control-row">
            <button className="control-btn" onClick={() => direction.y === 0 && setNextDirection(DIRECTIONS.UP)}>⬆️</button>
          </div>
          <div className="control-row">
            <button className="control-btn" onClick={() => direction.x === 0 && setNextDirection(DIRECTIONS.LEFT)}>⬅️</button>
            <button className="control-btn" onClick={() => direction.x === 0 && setNextDirection(DIRECTIONS.RIGHT)}>➡️</button>
          </div>
          <div className="control-row">
            <button className="control-btn" onClick={() => direction.y === 0 && setNextDirection(DIRECTIONS.DOWN)}>⬇️</button>
          </div>
        </div>
      )}

      {!gameStarted && !gameOver && (
        <div className="start-overlay">
          <div className="start-content">
            <h2 className="start-title">Ready to Slither?</h2>
            <p className="start-instructions">
              Eat the food to grow longer!<br/>
              Don't hit walls or yourself!<br/>
              {isTouchDevice() ? 'Swipe or use buttons!' : 'Use arrow keys!'}
            </p>
            <button className="start-button" onClick={startGame}>
              Start Game!
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="win-overlay">
          <div className="win-content lose-content">
            <h1 className="win-title">Game Over!</h1>
            <p className="win-message">Your snake was {snake.length} long!</p>
            <p className="win-stats">Final Score: {score}</p>
            {score === highScore && score > 0 && (
              <p className="win-stats high">🎉 New High Score! 🎉</p>
            )}
            <div className="win-buttons">
              <button className="play-again-button" onClick={startGame}>
                Play Again
              </button>
              <button className="back-to-hub-button" onClick={onBackToHub}>
                Choose Another Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Snake
