import { useState, useEffect } from 'react'
import soundPlayer from '../../../utils/sounds'
import { isTouchDevice } from '../../../utils/deviceDetection'
import './TicTacToe.css'

// Difficulty configurations for bot
const DIFFICULTY_CONFIG = {
  easy: 'Easy Bot - Makes random moves',
  medium: 'Medium Bot - Blocks some moves',
  hard: 'Hard Bot - Unbeatable AI'
}

function TicTacToe({ difficulty = 'easy', onBackToHub }) {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState(null)
  const [winningLine, setWinningLine] = useState([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [gameMode, setGameMode] = useState(null) // null, 'pvp', 'bot'
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })

  useEffect(() => {
    // Bot's turn
    if (gameMode === 'bot' && !isXNext && !winner) {
      const timer = setTimeout(() => {
        makeBotMove()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isXNext, winner, gameMode, board])

  const selectMode = (mode) => {
    setGameMode(mode)
    soundPlayer.playClick()
  }

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]

    for (let line of lines) {
      const [a, b, c] = line
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line }
      }
    }
    return null
  }

  const handleClick = (index) => {
    if (board[index] || winner) return
    if (gameMode === 'bot' && !isXNext) return // Prevent clicking during bot's turn

    makeMove(index)
  }

  const makeMove = (index) => {
    if (board[index] || winner) return

    soundPlayer.playFlip()
    const newBoard = board.slice()
    newBoard[index] = isXNext ? 'X' : 'O'
    setBoard(newBoard)

    const result = calculateWinner(newBoard)
    if (result) {
      setWinner(result.winner)
      setWinningLine(result.line)
      soundPlayer.playWin()
      setScores(prev => ({ ...prev, [result.winner]: prev[result.winner] + 1 }))
    } else if (newBoard.every(square => square !== null)) {
      setWinner('Draw')
      soundPlayer.playNoMatch()
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }))
    } else {
      setIsXNext(!isXNext)
    }
  }

  const makeBotMove = () => {
    if (winner) return

    let move
    if (difficulty === 'hard') {
      move = getBestMove(board)
    } else if (difficulty === 'medium') {
      move = Math.random() < 0.7 ? getSmartMove(board) : getRandomMove(board)
    } else {
      move = getRandomMove(board)
    }

    if (move !== null) {
      makeMove(move)
    }
  }

  const getRandomMove = (squares) => {
    const available = squares.map((val, idx) => val === null ? idx : null).filter(val => val !== null)
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null
  }

  const getSmartMove = (squares) => {
    // Try to win or block
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]

    // Try to win
    for (let line of lines) {
      const [a, b, c] = line
      if (squares[a] === 'O' && squares[b] === 'O' && !squares[c]) return c
      if (squares[a] === 'O' && squares[c] === 'O' && !squares[b]) return b
      if (squares[b] === 'O' && squares[c] === 'O' && !squares[a]) return a
    }

    // Try to block
    for (let line of lines) {
      const [a, b, c] = line
      if (squares[a] === 'X' && squares[b] === 'X' && !squares[c]) return c
      if (squares[a] === 'X' && squares[c] === 'X' && !squares[b]) return b
      if (squares[b] === 'X' && squares[c] === 'X' && !squares[a]) return a
    }

    return getRandomMove(squares)
  }

  const getBestMove = (squares) => {
    // Minimax algorithm for unbeatable AI
    const minimax = (board, depth, isMaximizing) => {
      const result = calculateWinner(board)
      if (result) return result.winner === 'O' ? 10 - depth : depth - 10
      if (board.every(square => square !== null)) return 0

      if (isMaximizing) {
        let bestScore = -Infinity
        for (let i = 0; i < 9; i++) {
          if (board[i] === null) {
            board[i] = 'O'
            const score = minimax(board, depth + 1, false)
            board[i] = null
            bestScore = Math.max(score, bestScore)
          }
        }
        return bestScore
      } else {
        let bestScore = Infinity
        for (let i = 0; i < 9; i++) {
          if (board[i] === null) {
            board[i] = 'X'
            const score = minimax(board, depth + 1, true)
            board[i] = null
            bestScore = Math.min(score, bestScore)
          }
        }
        return bestScore
      }
    }

    let bestScore = -Infinity
    let bestMove = null
    const testBoard = squares.slice()

    for (let i = 0; i < 9; i++) {
      if (testBoard[i] === null) {
        testBoard[i] = 'O'
        const score = minimax(testBoard, 0, false)
        testBoard[i] = null
        if (score > bestScore) {
          bestScore = score
          bestMove = i
        }
      }
    }

    return bestMove
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinner(null)
    setWinningLine([])
    soundPlayer.playClick()
  }

  const changeMode = () => {
    setGameMode(null)
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinner(null)
    setWinningLine([])
    setScores({ X: 0, O: 0, draws: 0 })
    soundPlayer.playClick()
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    soundPlayer.enabled = !soundEnabled
  }

  return (
    <div className="tictactoe-game">
      <div className="tictactoe-header">
        <button className="back-button" onClick={onBackToHub}>
          ← Back
        </button>
        <h1 className="tictactoe-title">Tic-Tac-Toe</h1>
        <button className="sound-toggle" onClick={toggleSound}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {!gameMode && (
        <div className="mode-selector">
          <h2 className="mode-title">Choose Game Mode</h2>
          <div className="mode-buttons">
            <button className="mode-button pvp" onClick={() => selectMode('pvp')}>
              <div className="mode-icon">👥</div>
              <div className="mode-name">Player vs Player</div>
              <div className="mode-description">Play with a friend!</div>
            </button>
            <button className="mode-button bot" onClick={() => selectMode('bot')}>
              <div className="mode-icon">🤖</div>
              <div className="mode-name">Player vs Bot</div>
              <div className="mode-description">{DIFFICULTY_CONFIG[difficulty]}</div>
            </button>
          </div>
        </div>
      )}

      {gameMode && (
        <>
          <div className="tictactoe-info">
            <div className="scores">
              <div className="score-item">
                <span className="score-label">X (You):</span>
                <span className="score-value">{scores.X}</span>
              </div>
              <div className="score-item">
                <span className="score-label">{gameMode === 'bot' ? 'O (Bot)' : 'O (Player 2)'}:</span>
                <span className="score-value">{scores.O}</span>
              </div>
              <div className="score-item">
                <span className="score-label">Draws:</span>
                <span className="score-value">{scores.draws}</span>
              </div>
            </div>
            <div className="turn-indicator">
              {!winner && (
                <span className="current-turn">
                  {isXNext ? "X's Turn" : gameMode === 'bot' ? "Bot's Turn..." : "O's Turn"}
                </span>
              )}
            </div>
          </div>

          <div className="board">
            {board.map((square, index) => (
              <button
                key={index}
                className={`square ${square ? 'filled' : ''} ${
                  winningLine.includes(index) ? 'winning' : ''
                }`}
                onClick={() => handleClick(index)}
                disabled={!!square || !!winner || (gameMode === 'bot' && !isXNext)}
              >
                {square === 'X' ? '❌' : square === 'O' ? '⭕' : ''}
              </button>
            ))}
          </div>

          <div className="game-controls">
            <button className="control-button reset" onClick={resetGame}>
              🔄 New Round
            </button>
            <button className="control-button change-mode" onClick={changeMode}>
              🔀 Change Mode
            </button>
          </div>

          {winner && (
            <div className="win-overlay">
              <div className="win-content">
                <h1 className="win-title">
                  {winner === 'Draw' ? '🤝 Draw!' : `🎉 ${winner} Wins! 🎉`}
                </h1>
                <p className="win-message">
                  {winner === 'Draw'
                    ? 'Good game!'
                    : winner === 'X'
                    ? 'You won!'
                    : gameMode === 'bot'
                    ? 'Bot won this time!'
                    : 'Player 2 won!'}
                </p>
                <div className="win-buttons">
                  <button className="play-again-button" onClick={resetGame}>
                    Play Again
                  </button>
                  <button className="back-to-hub-button" onClick={onBackToHub}>
                    Main Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TicTacToe
