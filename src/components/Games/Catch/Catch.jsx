import { useState, useEffect, useRef, useCallback } from 'react'
import soundPlayer from '../../../utils/sounds'
import './Catch.css'

// Game objects
const GOOD_ITEMS = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉']
const BAD_ITEMS = ['💣', '🪨', '⚡', '🔥']

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  easy: {
    speed: 1.5,
    spawnRate: 2000,
    badItemChance: 0.2,
    winScore: 15,
    lives: 5
  },
  medium: {
    speed: 2.5,
    spawnRate: 1500,
    badItemChance: 0.3,
    winScore: 25,
    lives: 3
  },
  hard: {
    speed: 4,
    spawnRate: 1000,
    badItemChance: 0.4,
    winScore: 40,
    lives: 3
  }
}

function Catch({ difficulty = 'easy', onBackToHub }) {
  const [basketPosition, setBasketPosition] = useState(50) // percentage
  const [fallingItems, setFallingItems] = useState([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(DIFFICULTY_CONFIG[difficulty].lives)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [nextId, setNextId] = useState(0)
  
  const gameAreaRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastUpdateRef = useRef(Date.now())
  const mousePositionRef = useRef(50)
  const config = DIFFICULTY_CONFIG[difficulty]

  // Handle keyboard/touch controls
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        setBasketPosition(prev => Math.max(0, prev - 5))
      } else if (e.key === 'ArrowRight') {
        setBasketPosition(prev => Math.min(100, prev + 5))
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, gameOver])

  // Handle mouse/touch movement - optimized with useCallback and ref
  const handleMouseMove = useCallback((e) => {
    if (!gameStarted || gameOver) return
    
    const gameArea = gameAreaRef.current
    if (!gameArea) return

    const rect = gameArea.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    mousePositionRef.current = Math.max(0, Math.min(100, percentage))
  }, [gameStarted, gameOver])

  const handleTouchMove = useCallback((e) => {
    if (!gameStarted || gameOver) return
    
    const gameArea = gameAreaRef.current
    if (!gameArea) return

    const touch = e.touches[0]
    const rect = gameArea.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const percentage = (x / rect.width) * 100
    mousePositionRef.current = Math.max(0, Math.min(100, percentage))
  }, [gameStarted, gameOver])

  // Spawn falling items
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const spawnInterval = setInterval(() => {
      const isGood = Math.random() > config.badItemChance
      const items = isGood ? GOOD_ITEMS : BAD_ITEMS
      const item = items[Math.floor(Math.random() * items.length)]
      
      const newItem = {
        id: nextId,
        emoji: item,
        isGood: isGood,
        x: Math.random() * 90 + 5, // 5% to 95%
        y: -10
      }
      
      setNextId(prev => prev + 1)
      setFallingItems(prev => [...prev, newItem])
    }, config.spawnRate)

    return () => clearInterval(spawnInterval)
  }, [gameStarted, gameOver, nextId, config])

  // Update falling items position with requestAnimationFrame for better performance
  useEffect(() => {
    if (!gameStarted || gameOver) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = now - lastUpdateRef.current
      
      // Only update if enough time has passed (cap at 60 FPS)
      if (deltaTime > 16) {
        lastUpdateRef.current = now
        
        // Update basket position from ref
        setBasketPosition(mousePositionRef.current)
        
        setFallingItems(prev => {
          return prev.map(item => ({
            ...item,
            y: item.y + (config.speed * 0.5) // Reduced multiplier for smoother movement
          })).filter(item => {
            // Check if item reached the bottom
            if (item.y > 85) {
              // Check if caught by basket (within ±8% of basket position)
              const caught = Math.abs(item.x - mousePositionRef.current) < 8
              
              if (caught) {
                if (item.isGood) {
                  setScore(s => s + 1)
                  soundPlayer.playMatch()
                } else {
                  setLives(l => l - 1)
                  soundPlayer.playNoMatch()
                }
              } else if (item.isGood) {
                // Missed a good item
                setLives(l => l - 1)
                soundPlayer.playNoMatch()
              }
              
              return false // Remove item
            }
            return true // Keep item
          })
        })
      }
      
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameStarted, gameOver, config])

  // Check win/lose conditions
  useEffect(() => {
    if (lives <= 0) {
      setGameOver(true)
    }
    if (score >= config.winScore) {
      setGameOver(true)
      soundPlayer.playWin()
    }
  }, [lives, score, config])

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setLives(config.lives)
    setFallingItems([])
    setGameOver(false)
    soundPlayer.playClick()
  }

  const resetGame = () => {
    setGameStarted(false)
    setScore(0)
    setLives(config.lives)
    setFallingItems([])
    setGameOver(false)
    setBasketPosition(50)
  }

  const toggleSound = () => {
    const newState = soundPlayer.toggle()
    setSoundEnabled(newState)
  }

  const isWin = gameOver && score >= config.winScore

  return (
    <div className="catch-game">
      <div className="catch-header">
        <button className="back-button" onClick={onBackToHub}>
          ← Back
        </button>
        <h1 className="catch-title">Catch & Collect</h1>
        <div className="header-right">
          <button 
            className="sound-toggle" 
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      <div className="catch-stats">
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}/{config.winScore}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Lives:</span>
          <span className="stat-value">{'❤️'.repeat(lives)}</span>
        </div>
      </div>

      {!gameStarted && !gameOver && (
        <div className="start-overlay">
          <div className="start-content">
            <h2 className="start-title">Ready to Play?</h2>
            <p className="start-instructions">
              Catch the good food 🍎🍌🍇<br/>
              Avoid the bad stuff 💣🪨<br/>
              Use your mouse or arrow keys!
            </p>
            <button className="start-button" onClick={startGame}>
              Start Game!
            </button>
          </div>
        </div>
      )}

      <div 
        ref={gameAreaRef}
        className="game-area"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {fallingItems.map(item => (
          <div
            key={item.id}
            className={`falling-item ${item.isGood ? 'good' : 'bad'}`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`
            }}
          >
            {item.emoji}
          </div>
        ))}

        <div 
          className="basket"
          style={{ left: `${basketPosition}%` }}
        >
          🧺
        </div>
      </div>

      {gameOver && (
        <div className="win-overlay">
          <div className="win-content">
            {isWin ? (
              <>
                <h1 className="win-title">🎉 You Win! 🎉</h1>
                <p className="win-message">Amazing job collecting {config.winScore} items!</p>
              </>
            ) : (
              <>
                <h1 className="win-title lose-title">😢 Game Over!</h1>
                <p className="win-message">You scored {score} points!</p>
              </>
            )}
            <div className="win-buttons">
              <button className="play-again-button" onClick={resetGame}>
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

export default Catch
