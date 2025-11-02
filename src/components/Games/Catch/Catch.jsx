import { useState, useEffect, useRef, useCallback } from 'react'
import soundPlayer from '../../../utils/sounds'
import { isTouchDevice } from '../../../utils/deviceDetection'
import './Catch.css'

// Game objects for different themes
const THEMES = {
  city: {
    name: 'City',
    background: 'linear-gradient(to bottom, #87CEEB 0%, #FFA500 50%, #FF6B6B 100%)',
    decorations: ['🏢', '🏙️', '🌆', '🏗️'],
    goodItems: ['🍕', '🍔', '🌭', '🍟', '🥤', '🍩'],
    badItems: ['🗑️', '💨', '🚧', '⚠️']
  },
  forest: {
    name: 'Forest',
    background: 'linear-gradient(to bottom, #87CEEB 0%, #90EE90 50%, #228B22 100%)',
    decorations: ['🌲', '🌳', '🌴', '🍃'],
    goodItems: ['🍎', '🍄', '🥕', '🌰', '🍓', '🍒'],
    badItems: ['🪨', '🐝', '🕷️', '☠️']
  },
  beach: {
    name: 'Beach',
    background: 'linear-gradient(to bottom, #87CEEB 0%, #F0E68C 50%, #DEB887 100%)',
    decorations: ['🏖️', '🏰', '⛱️', '🌊'],
    goodItems: ['🐚', '⭐', '🐠', '🦀', '🍉', '🥥'],
    badItems: ['🦈', '🪼', '🌊', '⚡']
  },
  space: {
    name: 'Space',
    background: 'linear-gradient(to bottom, #000428 0%, #004e92 50%, #1a1a2e 100%)',
    decorations: ['🧑‍🚀', '🛸', '🪐', '🌍'],
    goodItems: ['⭐', '🌟', '✨', '🪐', '🌙', '☄️'],
    badItems: ['💫', '🌑', '☄️', '👽']
  },
  ocean: {
    name: 'Ocean',
    background: 'linear-gradient(to bottom, #003973 0%, #0077be 50%, #00a8cc 100%)',
    decorations: ['🦈', '🐋', '🐬', '🪸'],
    goodItems: ['🐟', '🐠', '🐡', '🦑', '🐙', '🦞'],
    badItems: ['🦈', '🪼', '⚓', '💀']
  },
  candy: {
    name: 'Candy Land',
    background: 'linear-gradient(to bottom, #FFB6C1 0%, #FFC0CB 50%, #FF69B4 100%)',
    decorations: ['🍭', '🍬', '🧁', '🍰'],
    goodItems: ['🍬', '🍭', '🍫', '🧁', '🍰', '🍪'],
    badItems: ['🦷', '🪳', '🕷️', '🐜']
  }
}

const THEME_ORDER = ['city', 'forest', 'beach', 'space', 'ocean', 'candy']

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  easy: {
    speed: 1.5,
    spawnRate: 2000,
    badItemChance: 0.2,
    lives: 5
  },
  medium: {
    speed: 2.5,
    spawnRate: 1500,
    badItemChance: 0.3,
    lives: 3
  },
  hard: {
    speed: 4,
    spawnRate: 1000,
    badItemChance: 0.4,
    lives: 1
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
  const [isPaused, setIsPaused] = useState(false)
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0)
  const [isUsingThumbstick, setIsUsingThumbstick] = useState(false)
  
  const gameAreaRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastUpdateRef = useRef(Date.now())
  const mousePositionRef = useRef(50)
  const thumbstickRef = useRef(null)
  const config = DIFFICULTY_CONFIG[difficulty]
  const currentTheme = THEMES[THEME_ORDER[currentThemeIndex]]

  // Handle keyboard/touch controls
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        setBasketPosition(prev => Math.max(0, prev - 5))
      } else if (e.key === 'ArrowRight') {
        setBasketPosition(prev => Math.min(100, prev + 5))
      } else if (e.key === 'Escape' || e.key === ' ') {
        setIsPaused(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, gameOver, isPaused])

  // Handle mouse/touch movement - optimized with useCallback and ref
  const handleMouseMove = useCallback((e) => {
    if (!gameStarted || gameOver || isPaused) return
    
    const gameArea = gameAreaRef.current
    if (!gameArea) return

    const rect = gameArea.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    mousePositionRef.current = Math.max(0, Math.min(100, percentage))
  }, [gameStarted, gameOver, isPaused])

  const handleTouchMove = useCallback((e) => {
    if (!gameStarted || gameOver || isPaused) return
    
    const gameArea = gameAreaRef.current
    if (!gameArea) return

    const touch = e.touches[0]
    const rect = gameArea.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const percentage = (x / rect.width) * 100
    mousePositionRef.current = Math.max(0, Math.min(100, percentage))
  }, [gameStarted, gameOver, isPaused])

  // Thumbstick handlers for touch devices
  const handleThumbstickStart = useCallback((e) => {
    if (!gameStarted || gameOver || isPaused) return
    setIsUsingThumbstick(true)
  }, [gameStarted, gameOver, isPaused])

  const handleThumbstickMove = useCallback((e) => {
    if (!gameStarted || gameOver || isPaused || !isUsingThumbstick) return
    
    const thumbstick = thumbstickRef.current
    if (!thumbstick) return

    const touch = e.touches[0]
    const rect = thumbstick.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const percentage = (x / rect.width) * 100
    mousePositionRef.current = Math.max(0, Math.min(100, percentage))
  }, [gameStarted, gameOver, isPaused, isUsingThumbstick])

  const handleThumbstickEnd = useCallback(() => {
    setIsUsingThumbstick(false)
  }, [])

  // Spawn falling items
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return

    const spawnInterval = setInterval(() => {
      const isGood = Math.random() > config.badItemChance
      const items = isGood ? currentTheme.goodItems : currentTheme.badItems
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
  }, [gameStarted, gameOver, isPaused, nextId, config, currentTheme])

  // Update falling items position with requestAnimationFrame for better performance
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) {
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
                  setScore(s => {
                    const newScore = s + 1
                    // Change theme every 5 catches
                    if (newScore % 5 === 0) {
                      setCurrentThemeIndex(prev => (prev + 1) % THEME_ORDER.length)
                    }
                    return newScore
                  })
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
  }, [gameStarted, gameOver, isPaused, config])

  // Check lose condition
  useEffect(() => {
    if (lives <= 0 && gameStarted) {
      setGameOver(true)
    }
  }, [lives, gameStarted])

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setLives(config.lives)
    setFallingItems([])
    setGameOver(false)
    setIsPaused(false)
    setCurrentThemeIndex(0)
    soundPlayer.playClick()
  }

  const resetGame = () => {
    setGameStarted(false)
    setScore(0)
    setLives(config.lives)
    setFallingItems([])
    setGameOver(false)
    setBasketPosition(50)
    setIsPaused(false)
    setCurrentThemeIndex(0)
  }

  const togglePause = () => {
    setIsPaused(prev => !prev)
    soundPlayer.playClick()
  }

  const toggleSound = () => {
    const newState = soundPlayer.toggle()
    setSoundEnabled(newState)
  }

  return (
    <div className="catch-game">
      <div className="catch-header">
        <button className="back-button" onClick={onBackToHub}>
          ← Back
        </button>
        <h1 className="catch-title">Catch & Collect</h1>
        <div className="header-right">
          {gameStarted && !gameOver && (
            <button 
              className="pause-button" 
              onClick={togglePause}
              aria-label="Pause"
            >
              {isPaused ? '▶️' : '⏸️'}
            </button>
          )}
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
        <div className="stat-item theme-indicator">
          <span className="stat-label">Theme:</span>
          <span className="stat-value">{currentTheme.name}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Lives:</span>
          <span className="stat-value">{'❤️'.repeat(Math.max(0, lives))}</span>
        </div>
      </div>

      {!gameStarted && !gameOver && (
        <div className="start-overlay">
          <div className="start-content">
            <h2 className="start-title">Ready to Play?</h2>
            <p className="start-instructions">
              Catch as many items as you can!<br/>
              Collect good items, avoid bad ones!<br/>
              Theme changes every 5 catches! 🎨<br/>
              {isTouchDevice() ? 'Use the slider at the bottom!' : 'Use your mouse or arrow keys!'}
            </p>
            <button className="start-button" onClick={startGame}>
              Start Game!
            </button>
          </div>
        </div>
      )}

      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-content">
            <h2 className="pause-title">⏸️ Paused</h2>
            <p className="pause-stats">Score: {score} • Lives: {lives}</p>
            <div className="pause-buttons">
              <button className="resume-button" onClick={togglePause}>
                ▶️ Resume
              </button>
              <button className="restart-button" onClick={resetGame}>
                🔄 Restart
              </button>
              <button className="menu-button" onClick={onBackToHub}>
                🏠 Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      <div 
        ref={gameAreaRef}
        className="game-area"
        style={{ background: currentTheme.background }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Background decorations */}
        {currentTheme.decorations && currentTheme.decorations.map((decoration, index) => (
          <div
            key={`decoration-${index}`}
            className="decoration"
            style={{
              left: `${(index * 25) + 10}%`,
              bottom: index % 2 === 0 ? '10%' : '20%',
              animationDelay: `${index * 0.5}s`
            }}
          >
            {decoration}
          </div>
        ))}

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
          <div className="win-content lose-content">
            <h1 className="win-title lose-title">Game Over!</h1>
            <p className="win-message">You scored {score} points!</p>
            <p className="win-stats">Made it to: {currentTheme.name}</p>
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

      {/* Touch device thumbstick/slider */}
      {isTouchDevice() && gameStarted && !gameOver && (
        <div 
          ref={thumbstickRef}
          className="thumbstick-container"
          onTouchStart={handleThumbstickStart}
          onTouchMove={handleThumbstickMove}
          onTouchEnd={handleThumbstickEnd}
        >
          <div className="thumbstick-track">
            <div 
              className="thumbstick-thumb"
              style={{ left: `${basketPosition}%` }}
            >
              🧺
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Catch
