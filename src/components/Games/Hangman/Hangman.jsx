import { useState, useEffect } from 'react'
import soundPlayer from '../../../utils/sounds'
import { isTouchDevice } from '../../../utils/deviceDetection'
import './Hangman.css'

// Word lists by difficulty
const WORD_LISTS = {
  easy: ['CAT', 'DOG', 'SUN', 'HAT', 'PEN', 'CUP', 'BED', 'EGG', 'BAT', 'FAN'],
  medium: ['APPLE', 'TIGER', 'HOUSE', 'MUSIC', 'PIZZA', 'BEACH', 'HAPPY', 'WATER', 'CLOUD', 'TRAIN'],
  hard: ['ELEPHANT', 'COMPUTER', 'BIRTHDAY', 'RAINBOW', 'DINOSAUR', 'TREASURE', 'AIRPLANE', 'BUTTERFLY', 'MOUNTAIN', 'CHOCOLATE']
}

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  easy: {
    maxWrong: 8,
    hint: true
  },
  medium: {
    maxWrong: 6,
    hint: false
  },
  hard: {
    maxWrong: 4,
    hint: false
  }
}

// Hangman stages (visual representation)
const HANGMAN_STAGES = [
  '', // 0 wrong
  '😟', // 1 wrong
  '😟\n |', // 2 wrong
  '😟\n/|', // 3 wrong
  '😟\n/|\\', // 4 wrong
  '😟\n/|\\\n |', // 5 wrong
  '😟\n/|\\\n/ \\', // 6 wrong (game over in medium)
  '💀\n/|\\\n/ \\', // 7 wrong
  '💀\n/|\\\n/ \\', // 8 wrong (game over in easy)
]

function Hangman({ difficulty = 'easy', onBackToHub }) {
  const [currentWord, setCurrentWord] = useState('')
  const [guessedLetters, setGuessedLetters] = useState([])
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hint, setHint] = useState('')

  const config = DIFFICULTY_CONFIG[difficulty]
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  // Initialize game
  useEffect(() => {
    startNewGame()
  }, [difficulty])

  const startNewGame = () => {
    const words = WORD_LISTS[difficulty]
    const word = words[Math.floor(Math.random() * words.length)]
    setCurrentWord(word)
    setGuessedLetters([])
    setWrongGuesses(0)
    setGameWon(false)
    setGameOver(false)
    
    // Set hint for easy mode
    if (config.hint) {
      const hints = {
        'CAT': '🐱', 'DOG': '🐕', 'SUN': '☀️', 'HAT': '🎩', 'PEN': '🖊️',
        'CUP': '☕', 'BED': '🛏️', 'EGG': '🥚', 'BAT': '🦇', 'FAN': '💨'
      }
      setHint(hints[word] || '❓')
    }
  }

  const handleLetterClick = (letter) => {
    if (guessedLetters.includes(letter) || gameWon || gameOver) return

    soundPlayer.playClick()
    setGuessedLetters([...guessedLetters, letter])

    if (currentWord.includes(letter)) {
      soundPlayer.playMatch()
      
      // Check if won
      const newGuessed = [...guessedLetters, letter]
      const won = currentWord.split('').every(l => newGuessed.includes(l))
      if (won) {
        setGameWon(true)
        soundPlayer.playWin()
      }
    } else {
      soundPlayer.playNoMatch()
      const newWrong = wrongGuesses + 1
      setWrongGuesses(newWrong)
      
      if (newWrong >= config.maxWrong) {
        setGameOver(true)
      }
    }
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    soundPlayer.enabled = !soundEnabled
  }

  const displayWord = currentWord.split('').map(letter => 
    guessedLetters.includes(letter) ? letter : '_'
  ).join(' ')

  const hangmanDisplay = HANGMAN_STAGES[Math.min(wrongGuesses, HANGMAN_STAGES.length - 1)]

  return (
    <div className="hangman-game">
      <div className="hangman-header">
        <button className="back-button" onClick={onBackToHub}>
          ← Back
        </button>
        <h1 className="hangman-title">Hangman</h1>
        <button className="sound-toggle" onClick={toggleSound}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <div className="hangman-stats">
        <div className="stat-item">
          <span className="stat-label">Wrong:</span>
          <span className="stat-value">{wrongGuesses}/{config.maxWrong}</span>
        </div>
        {config.hint && (
          <div className="stat-item hint-item">
            <span className="stat-label">Hint:</span>
            <span className="stat-value">{hint}</span>
          </div>
        )}
      </div>

      <div className="hangman-display">
        <div className="hangman-figure">
          <pre className="hangman-ascii">{hangmanDisplay}</pre>
        </div>
        <div className="word-display">
          {displayWord}
        </div>
      </div>

      <div className="keyboard">
        {alphabet.map(letter => (
          <button
            key={letter}
            className={`letter-button ${
              guessedLetters.includes(letter)
                ? currentWord.includes(letter)
                  ? 'correct'
                  : 'wrong'
                : ''
            }`}
            onClick={() => handleLetterClick(letter)}
            disabled={guessedLetters.includes(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      {gameWon && (
        <div className="win-overlay">
          <div className="win-content">
            <h1 className="win-title">🎉 You Win! 🎉</h1>
            <p className="win-message">You guessed the word!</p>
            <p className="win-stats">The word was: <strong>{currentWord}</strong></p>
            <p className="win-stats">Wrong guesses: {wrongGuesses}/{config.maxWrong}</p>
            <div className="win-buttons">
              <button className="play-again-button" onClick={startNewGame}>
                Play Again
              </button>
              <button className="back-to-hub-button" onClick={onBackToHub}>
                Choose Another Game
              </button>
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="win-overlay">
          <div className="win-content lose-content">
            <h1 className="win-title lose-title">Game Over!</h1>
            <p className="win-message">Better luck next time!</p>
            <p className="win-stats">The word was: <strong>{currentWord}</strong></p>
            <div className="win-buttons">
              <button className="play-again-button" onClick={startNewGame}>
                Try Again
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

export default Hangman
