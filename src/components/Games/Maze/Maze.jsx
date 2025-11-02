import { useState, useEffect, useCallback, useRef } from 'react'
import soundPlayer from '../../../utils/sounds'
import { isTouchDevice } from '../../../utils/deviceDetection'
import './Maze.css'

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  easy: {
    size: 9, // 9x9 maze
    collectibles: 3
  },
  medium: {
    size: 13, // 13x13 maze
    collectibles: 5
  },
  hard: {
    size: 17, // 17x17 maze
    collectibles: 7
  }
}

function Maze({ difficulty = 'easy', onBackToHub }) {
  const [maze, setMaze] = useState([])
  const [player, setPlayer] = useState({ x: 0, y: 0 })
  const [exit, setExit] = useState({ x: 0, y: 0 })
  const [collectibles, setCollectibles] = useState([])
  const [collected, setCollected] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [moves, setMoves] = useState(0)
  
  const config = DIFFICULTY_CONFIG[difficulty]
  const touchStartRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    generateMaze()
  }, [difficulty])

  useEffect(() => {
    if (!gameStarted || gameWon) return

    const handleKeyPress = (e) => {
      e.preventDefault()
      switch (e.key) {
        case 'ArrowUp':
          movePlayer(0, -1)
          break
        case 'ArrowDown':
          movePlayer(0, 1)
          break
        case 'ArrowLeft':
          movePlayer(-1, 0)
          break
        case 'ArrowRight':
          movePlayer(1, 0)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, gameWon, player, maze])

  const generateMaze = () => {
    const size = config.size
    const newMaze = Array(size).fill(null).map(() => Array(size).fill(1)) // 1 = wall

    // Recursive backtracking maze generation
    const carve = (x, y) => {
      const directions = [
        [0, -1], [1, 0], [0, 1], [-1, 0]
      ].sort(() => Math.random() - 0.5)

      newMaze[y][x] = 0 // 0 = path

      for (let [dx, dy] of directions) {
        const nx = x + dx * 2
        const ny = y + dy * 2

        if (nx >= 0 && nx < size && ny >= 0 && ny < size && newMaze[ny][nx] === 1) {
          newMaze[y + dy][x + dx] = 0
          carve(nx, ny)
        }
      }
    }

    carve(0, 0)
    setMaze(newMaze)

    // Set player start
    setPlayer({ x: 0, y: 0 })

    // Set exit (bottom-right area)
    const exitPos = { x: size - 1, y: size - 1 }
    setExit(exitPos)

    // Helper function to check if a position is reachable from start
    const isReachable = (targetX, targetY) => {
      const visited = Array(size).fill(null).map(() => Array(size).fill(false))
      const queue = [{ x: 0, y: 0 }]
      visited[0][0] = true

      while (queue.length > 0) {
        const { x, y } = queue.shift()
        
        if (x === targetX && y === targetY) return true

        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]
        for (let [dx, dy] of directions) {
          const nx = x + dx
          const ny = y + dy

          if (nx >= 0 && nx < size && ny >= 0 && ny < size && 
              newMaze[ny][nx] === 0 && !visited[ny][nx]) {
            visited[ny][nx] = true
            queue.push({ x: nx, y: ny })
          }
        }
      }
      return false
    }

    // Get all valid path positions (excluding start and exit)
    const validPositions = []
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (newMaze[y][x] === 0 && 
            !(x === 0 && y === 0) && 
            !(x === exitPos.x && y === exitPos.y) &&
            isReachable(x, y)) {
          validPositions.push({ x, y })
        }
      }
    }

    // Randomly select collectibles from valid positions
    const newCollectibles = []
    const emojis = ['⭐', '💎', '🏆', '🎁', '🍕']
    
    // Shuffle valid positions
    const shuffled = validPositions.sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < Math.min(config.collectibles, shuffled.length); i++) {
      newCollectibles.push({
        x: shuffled[i].x,
        y: shuffled[i].y,
        emoji: emojis[i % emojis.length]
      })
    }

    setCollectibles(newCollectibles)
    setCollected(0)
    setMoves(0)
  }

  const startGame = () => {
    setGameStarted(true)
    setGameWon(false)
    soundPlayer.playClick()
  }

  const movePlayer = (dx, dy) => {
    if (!gameStarted || gameWon) return

    const newX = player.x + dx
    const newY = player.y + dy

    // Check bounds
    if (newX < 0 || newX >= config.size || newY < 0 || newY >= config.size) return

    // Check wall
    if (maze[newY][newX] === 1) {
      soundPlayer.playNoMatch()
      return
    }

    // Move player
    setPlayer({ x: newX, y: newY })
    setMoves(prev => prev + 1)
    soundPlayer.playFlip()

    // Check collectible
    const collectibleIndex = collectibles.findIndex(c => c.x === newX && c.y === newY && !c.collected)
    if (collectibleIndex !== -1) {
      const newCollectibles = [...collectibles]
      newCollectibles[collectibleIndex].collected = true
      setCollectibles(newCollectibles)
      setCollected(prev => prev + 1)
      soundPlayer.playMatch()
    }

    // Check exit
    if (newX === exit.x && newY === exit.y) {
      setGameWon(true)
      setGameStarted(false)
      soundPlayer.playWin()
    }
  }

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (!gameStarted || gameWon) return
    
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 30) movePlayer(1, 0)
      else if (deltaX < -30) movePlayer(-1, 0)
    } else {
      if (deltaY > 30) movePlayer(0, 1)
      else if (deltaY < -30) movePlayer(0, -1)
    }
  }, [gameStarted, gameWon, player, maze])

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    soundPlayer.enabled = !soundEnabled
  }

  const resetMaze = () => {
    generateMaze()
    setGameStarted(false)
    setGameWon(false)
  }

  return (
    <div 
      className="maze-game"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="maze-header">
        <button className="back-button" onClick={onBackToHub}>
          ← Back
        </button>
        <h1 className="maze-title">Maze Runner</h1>
        <button className="sound-toggle" onClick={toggleSound}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <div className="maze-stats">
        <div className="stat-item">
          <span className="stat-label">Collected:</span>
          <span className="stat-value">{collected}/{config.collectibles}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Moves:</span>
          <span className="stat-value">{moves}</span>
        </div>
      </div>

      <div className="maze-container">
        <div 
          className="maze-grid"
          style={{
            gridTemplateColumns: `repeat(${config.size}, 1fr)`,
            gridTemplateRows: `repeat(${config.size}, 1fr)`
          }}
        >
          {maze.map((row, y) =>
            row.map((cell, x) => {
              const isPlayer = player.x === x && player.y === y
              const isExit = exit.x === x && exit.y === y
              const collectible = collectibles.find(c => c.x === x && c.y === y && !c.collected)
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={`maze-cell ${cell === 1 ? 'wall' : 'path'} ${isPlayer ? 'player' : ''} ${isExit ? 'exit' : ''}`}
                >
                  {isPlayer && '🧑'}
                  {collectible && <span className="collectible">{collectible.emoji}</span>}
                  {isExit && '🏁'}
                </div>
              )
            })
          )}
        </div>
      </div>

      {isTouchDevice() && gameStarted && !gameWon && (
        <div className="touch-controls">
          <div className="control-row">
            <button className="control-btn" onClick={() => movePlayer(0, -1)}>⬆️</button>
          </div>
          <div className="control-row">
            <button className="control-btn" onClick={() => movePlayer(-1, 0)}>⬅️</button>
            <button className="control-btn" onClick={() => movePlayer(1, 0)}>➡️</button>
          </div>
          <div className="control-row">
            <button className="control-btn" onClick={() => movePlayer(0, 1)}>⬇️</button>
          </div>
        </div>
      )}

      {!gameStarted && !gameWon && (
        <div className="start-overlay">
          <div className="start-content">
            <h2 className="start-title">Ready to Navigate?</h2>
            <p className="start-instructions">
              Find your way to the exit 🏁<br/>
              Collect all {config.collectibles} items along the way!<br/>
              {isTouchDevice() ? 'Swipe or use buttons!' : 'Use arrow keys!'}
            </p>
            <button className="start-button" onClick={startGame}>
              Start Maze!
            </button>
          </div>
        </div>
      )}

      {gameWon && (
        <div className="win-overlay">
          <div className="win-content">
            <h1 className="win-title">🎉 You Escaped! 🎉</h1>
            <p className="win-message">You found the exit!</p>
            <p className="win-stats">Collected: {collected}/{config.collectibles}</p>
            <p className="win-stats">Total Moves: {moves}</p>
            <div className="win-buttons">
              <button className="play-again-button" onClick={resetMaze}>
                New Maze
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

export default Maze
