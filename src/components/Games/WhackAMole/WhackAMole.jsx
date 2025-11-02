import { useState, useEffect, useRef } from 'react'
import soundPlayer from '../../../utils/sounds'
import { isTouchDevice } from '../../../utils/deviceDetection'
import './WhackAMole.css'

const MOLES = ['🐹', '🦫', '🐿️', '🦔']
const BOMB = '💣'

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  easy: {
    gridSize: 3, // 3x3 grid
    popUpTime: 2000, // Mole stays up for 2 seconds
    popInterval: 1500, // New mole every 1.5 seconds
    bombChance: 0.1,
    gameDuration: 60 // 60 seconds
  },
  medium: {
    gridSize: 4, // 4x4 grid
    popUpTime: 1500,
    popInterval: 1000,
    bombChance: 0.2,
    gameDuration: 60
  },
  hard: {
    gridSize: 5, // 5x5 grid
    popUpTime: 1000,
    popInterval: 700,
    bombChance: 0.3,
    gameDuration: 60
  }
}

function WhackAMole({ difficulty = 'easy', onBackToHub }) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [activeMoles, setActiveMoles] = useState([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [highScore, setHighScore] = useState(0)
  
  const config = DIFFICULTY_CONFIG[difficulty]
  const popIntervalRef = useRef(null)
  const gameTimerRef = useRef(null)

  useEffect(() => {
    if (gameStarted && !gameOver) {
      // Start popping moles
      popIntervalRef.current = setInterval(() => {
        popRandomMole()
      }, config.popInterval)

      // Start game timer
      gameTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        if (popIntervalRef.current) clearInterval(popIntervalRef.current)
        if (gameTimerRef.current) clearInterval(gameTimerRef.current)
      }
    }
  }, [gameStarted, gameOver, config.popInterval])

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setTimeLeft(config.gameDuration)
    setActiveMoles([])
    soundPlayer.playClick()
  }

  const endGame = () => {
    setGameOver(true)
    setGameStarted(false)
    if (score > highScore) {
      setHighScore(score)
      soundPlayer.playWin()
    }
    if (popIntervalRef.current) clearInterval(popIntervalRef.current)
    if (gameTimerRef.current) clearInterval(gameTimerRef.current)
  }

  const popRandomMole = () => {
    const totalHoles = config.gridSize * config.gridSize
    const availableHoles = []
    
    for (let i = 0; i < totalHoles; i++) {
      if (!activeMoles.find(m => m.index === i)) {
        availableHoles.push(i)
      }
    }

    if (availableHoles.length === 0) return

    const randomIndex = availableHoles[Math.floor(Math.random() * availableHoles.length)]
    const isBomb = Math.random() < config.bombChance
    const mole = isBomb ? BOMB : MOLES[Math.floor(Math.random() * MOLES.length)]

    const newMole = {
      id: Date.now(),
      index: randomIndex,
      emoji: mole,
      isBomb: isBomb
    }

    setActiveMoles(prev => [...prev, newMole])

    // Auto-hide mole after popUpTime
    setTimeout(() => {
      setActiveMoles(prev => prev.filter(m => m.id !== newMole.id))
    }, config.popUpTime)
  }

  const whackMole = (mole) => {
    if (!gameStarted || gameOver) return

    setActiveMoles(prev => prev.filter(m => m.id !== mole.id))

    if (mole.isBomb) {
      setScore(prev => Math.max(0, prev - 5))
      soundPlayer.playNoMatch()
    } else {
      setScore(prev => prev + 1)
      soundPlayer.playMatch()
    }
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    soundPlayer.enabled = !soundEnabled
  }

  const holes = Array(config.gridSize * config.gridSize).fill(null)

  return (
    <div className="whackamole-game">
      <div className="whackamole-header">
        <button className="back-button" onClick={onBackToHub}>
          ← Back
        </button>
        <h1 className="whackamole-title">Whack-a-Mole</h1>
        <button className="sound-toggle" onClick={toggleSound}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <div className="whackamole-stats">
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Time:</span>
          <span className="stat-value">{timeLeft}s</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">High Score:</span>
          <span className="stat-value">{highScore}</span>
        </div>
      </div>

      <div 
        className="mole-grid"
        style={{ 
          gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${config.gridSize}, 1fr)`
        }}
      >
        {holes.map((_, index) => {
          const activeMole = activeMoles.find(m => m.index === index)
          return (
            <div
              key={index}
              className={`hole ${activeMole ? 'active' : ''}`}
              onClick={() => activeMole && whackMole(activeMole)}
            >
              <div className="hole-bg">🕳️</div>
              {activeMole && (
                <div className={`mole ${activeMole.isBomb ? 'bomb' : ''}`}>
                  {activeMole.emoji}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!gameStarted && !gameOver && (
        <div className="start-overlay">
          <div className="start-content">
            <h2 className="start-title">Ready to Whack?</h2>
            <p className="start-instructions">
              Click the moles before they disappear!<br/>
              Avoid the bombs 💣 (-5 points)<br/>
              {isTouchDevice() ? 'Tap quickly!' : 'Click fast!'}
            </p>
            <button className="start-button" onClick={startGame}>
              Start Game!
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="win-overlay">
          <div className="win-content">
            <h1 className="win-title">Time's Up!</h1>
            <p className="win-message">You whacked {score} moles!</p>
            {score === highScore && score > 0 && (
              <p className="win-stats">🎉 New High Score! 🎉</p>
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

export default WhackAMole
