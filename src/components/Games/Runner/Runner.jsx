import { useState, useEffect, useRef, useCallback } from 'react'
import soundPlayer from '../../../utils/sounds'
import { isTouchDevice } from '../../../utils/deviceDetection'
import './Runner.css'

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  easy: {
    speed: 1.5,
    obstacleFrequency: 2500,
    gravity: 0.6,
    jumpPower: 15
  },
  medium: {
    speed: 2.5,
    obstacleFrequency: 2000,
    gravity: 0.7,
    jumpPower: 16
  },
  hard: {
    speed: 4,
    obstacleFrequency: 1500,
    gravity: 0.8,
    jumpPower: 17
  }
}

const OBSTACLES = ['🌵', '🪨', '🦴', '🔥']
const COLLECTIBLES = ['⭐', '💎', '🍎', '🏅']

function Runner({ difficulty = 'easy', onBackToHub }) {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isJumping, setIsJumping] = useState(false)
  const [isDucking, setIsDucking] = useState(false)
  const [obstacles, setObstacles] = useState([])
  const [collectibles, setCollectibles] = useState([])
  const [nextId, setNextId] = useState(0)
  
  const animationFrameRef = useRef(null)
  const lastUpdateRef = useRef(Date.now())
  const playerYRef = useRef(0)
  const playerVelocityRef = useRef(0)
  const gameAreaRef = useRef(null)
  
  const config = DIFFICULTY_CONFIG[difficulty]

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setObstacles([])
    setCollectibles([])
    setNextId(0)
    playerYRef.current = 0
    playerVelocityRef.current = 0
    setIsJumping(false)
    setIsDucking(false)
    soundPlayer.playClick()
  }

  const jump = useCallback(() => {
    if (!gameStarted || gameOver || isJumping) return
    
    playerVelocityRef.current = config.jumpPower
    setIsJumping(true)
    soundPlayer.playFlip()
  }, [gameStarted, gameOver, isJumping, config.jumpPower])

  const duck = useCallback((ducking) => {
    if (!gameStarted || gameOver) return
    setIsDucking(ducking)
  }, [gameStarted, gameOver])

  // Handle keyboard controls
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      } else if (e.code === 'ArrowDown') {
        e.preventDefault()
        duck(true)
      }
    }

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowDown') {
        e.preventDefault()
        duck(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameStarted, gameOver, jump, duck])

  // Spawn obstacles and collectibles
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const spawnInterval = setInterval(() => {
      const isObstacle = Math.random() > 0.3
      
      if (isObstacle) {
        const obstacle = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)]
        setObstacles(prev => [...prev, {
          id: nextId,
          emoji: obstacle,
          x: 100,
          y: 0
        }])
        setNextId(prev => prev + 1)
      } else {
        const collectible = COLLECTIBLES[Math.floor(Math.random() * COLLECTIBLES.length)]
        const height = Math.random() > 0.5 ? 30 : 60 // Random height for collectibles
        setCollectibles(prev => [...prev, {
          id: nextId,
          emoji: collectible,
          x: 100,
          y: height
        }])
        setNextId(prev => prev + 1)
      }
    }, config.obstacleFrequency)

    return () => clearInterval(spawnInterval)
  }, [gameStarted, gameOver, nextId, config.obstacleFrequency])

  // Game loop
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
      
      if (deltaTime > 16) {
        lastUpdateRef.current = now
        
        // Update player physics
        playerVelocityRef.current -= config.gravity
        playerYRef.current += playerVelocityRef.current
        
        // Ground collision
        if (playerYRef.current <= 0) {
          playerYRef.current = 0
          playerVelocityRef.current = 0
          setIsJumping(false)
        }
        
        // Update obstacles
        setObstacles(prev => {
          return prev.map(obs => ({
            ...obs,
            x: obs.x - config.speed
          })).filter(obs => {
            // Remove if off screen
            if (obs.x < -10) return false
            
            // Collision detection with player - smaller hitbox for fairness
            const playerX = 15
            const playerY = playerYRef.current
            const playerHeight = isDucking ? 30 : 60
            const playerWidth = 30
            
            // Reduce hitbox by adding padding (makes hitbox much smaller)
            const hitboxPadding = 12
            
            const obsLeft = obs.x
            const obsRight = obs.x + 10
            const obsTop = obs.y + 50
            const obsBottom = obs.y
            
            const playerLeft = playerX + hitboxPadding
            const playerRight = playerX + playerWidth - hitboxPadding
            const playerTop = playerY + playerHeight - hitboxPadding
            const playerBottom = playerY + hitboxPadding
            
            // Simple AABB collision
            if (
              playerRight > obsLeft &&
              playerLeft < obsRight &&
              playerTop > obsBottom &&
              playerBottom < obsTop
            ) {
              setGameOver(true)
              soundPlayer.playNoMatch()
              return false
            }
            
            return true
          })
        })
        
        // Update collectibles
        setCollectibles(prev => {
          return prev.map(col => ({
            ...col,
            x: col.x - config.speed
          })).filter(col => {
            // Remove if off screen
            if (col.x < -10) return false
            
            // Collection detection
            const playerX = 15
            const playerY = playerYRef.current
            const playerHeight = isDucking ? 30 : 60
            
            const colCenterX = col.x + 5
            const colCenterY = col.y + 5
            
            if (
              Math.abs(colCenterX - (playerX + 15)) < 20 &&
              Math.abs(colCenterY - (playerY + playerHeight / 2)) < 30
            ) {
              setScore(s => s + 1)
              soundPlayer.playMatch()
              return false
            }
            
            return true
          })
        })
        
        // Increase score over time
        if (Math.random() < 0.02) {
          setScore(s => s + 1)
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    
    animationFrameRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameStarted, gameOver, config, isDucking])

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    soundPlayer.enabled = !soundEnabled
  }

  const playerBottom = playerYRef.current

  return (
    <div className="runner-game">
      <div className="runner-header">
        <button className="back-button" onClick={onBackToHub}>
          ← Back
        </button>
        <h1 className="runner-title">Super Runner</h1>
        <button className="sound-toggle" onClick={toggleSound}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <div className="runner-stats">
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
      </div>

      <div ref={gameAreaRef} className="runner-game-area">
        {/* Ground line */}
        <div className="ground"></div>
        
        {/* Player */}
        <div 
          className={`player ${isDucking ? 'ducking' : ''}`}
          style={{ bottom: `${playerBottom}px` }}
        >
          {isDucking ? '🦆' : '🏃'}
        </div>
        
        {/* Obstacles */}
        {obstacles.map(obs => (
          <div
            key={`obs-${obs.id}`}
            className="obstacle"
            style={{ 
              left: `${obs.x}%`,
              bottom: `${obs.y}px`
            }}
          >
            {obs.emoji}
          </div>
        ))}
        
        {/* Collectibles */}
        {collectibles.map(col => (
          <div
            key={`col-${col.id}`}
            className="collectible"
            style={{ 
              left: `${col.x}%`,
              bottom: `${col.y}px`
            }}
          >
            {col.emoji}
          </div>
        ))}
      </div>

      {!gameStarted && !gameOver && (
        <div className="start-overlay">
          <div className="start-content">
            <h2 className="start-title">Ready to Run?</h2>
            <p className="start-instructions">
              Jump over obstacles and collect stars!<br/>
              {isTouchDevice() ? 'Tap to jump!' : 'Press SPACE or ↑ to jump!<br/>Press ↓ to duck!'}
            </p>
            <button className="start-button" onClick={startGame}>
              Start Running!
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="win-overlay">
          <div className="win-content lose-content">
            <h1 className="win-title lose-title">Game Over!</h1>
            <p className="win-message">You scored {score} points!</p>
            <div className="win-buttons">
              <button className="play-again-button" onClick={startGame}>
                Try Again
              </button>
              <button className="back-to-hub-button" onClick={onBackToHub}>
                Choose Another Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Touch controls */}
      {isTouchDevice() && gameStarted && !gameOver && (
        <div className="touch-controls">
          <button 
            className="jump-button"
            onTouchStart={jump}
          >
            ⬆️ JUMP
          </button>
          <button 
            className="duck-button"
            onTouchStart={() => duck(true)}
            onTouchEnd={() => duck(false)}
          >
            ⬇️ DUCK
          </button>
        </div>
      )}
    </div>
  )
}

export default Runner
