import { useState, useEffect } from 'react'
import './PictureWords.css'

const PictureWords = ({ difficulty = 'easy', onBackToHub }) => {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [showWin, setShowWin] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [items, setItems] = useState([])

  const DIFFICULTY_CONFIG = {
    easy: {
      itemCount: 6,
      showChoices: true,
      images: [
        { word: 'CAT', emoji: '🐱' },
        { word: 'DOG', emoji: '🐶' },
        { word: 'SUN', emoji: '☀️' },
        { word: 'CAR', emoji: '🚗' },
        { word: 'BEE', emoji: '🐝' },
        { word: 'HAT', emoji: '🎩' },
        { word: 'BUS', emoji: '🚌' },
        { word: 'KEY', emoji: '🔑' },
      ]
    },
    medium: {
      itemCount: 8,
      showChoices: false,
      images: [
        { word: 'TREE', emoji: '🌲' },
        { word: 'FISH', emoji: '🐟' },
        { word: 'BIRD', emoji: '🐦' },
        { word: 'BOOK', emoji: '📖' },
        { word: 'MOON', emoji: '🌙' },
        { word: 'STAR', emoji: '⭐' },
        { word: 'RAIN', emoji: '🌧️' },
        { word: 'DUCK', emoji: '🦆' },
        { word: 'FROG', emoji: '🐸' },
        { word: 'GIFT', emoji: '🎁' },
      ]
    },
    hard: {
      itemCount: 10,
      showChoices: false,
      images: [
        { word: 'APPLE', emoji: '🍎' },
        { word: 'TIGER', emoji: '🐯' },
        { word: 'HOUSE', emoji: '🏠' },
        { word: 'PIZZA', emoji: '🍕' },
        { word: 'PLANE', emoji: '✈️' },
        { word: 'HEART', emoji: '❤️' },
        { word: 'CLOCK', emoji: '🕐' },
        { word: 'FLOWER', emoji: '🌸' },
        { word: 'ROCKET', emoji: '🚀' },
        { word: 'CASTLE', emoji: '🏰' },
        { word: 'TURTLE', emoji: '🐢' },
        { word: 'BANANA', emoji: '🍌' },
      ]
    }
  }

  const config = DIFFICULTY_CONFIG[difficulty]

  useEffect(() => {
    if (gameStarted && !showWin) {
      // Shuffle and select items for this round
      const shuffled = [...config.images].sort(() => Math.random() - 0.5)
      setItems(shuffled.slice(0, config.itemCount))
      setCurrentIndex(0)
      setScore(0)
      setAttempts(0)
      setUserInput('')
      setShowHint(false)
      setFeedback('')
    }
  }, [gameStarted, difficulty])

  const currentItem = items[currentIndex]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!userInput.trim() || !currentItem) return

    const userAnswer = userInput.trim().toUpperCase()
    const correctAnswer = currentItem.word

    setAttempts(prev => prev + 1)

    if (userAnswer === correctAnswer) {
      setFeedback('✓ Correct!')
      setScore(prev => prev + 1)
      
      // Move to next item
      setTimeout(() => {
        if (currentIndex + 1 >= items.length) {
          setShowWin(true)
        } else {
          setCurrentIndex(prev => prev + 1)
          setUserInput('')
          setShowHint(false)
          setFeedback('')
        }
      }, 1000)
    } else {
      setFeedback('✗ Try again!')
      setTimeout(() => setFeedback(''), 1500)
    }
  }

  const handleChoiceClick = (word) => {
    setUserInput(word)
  }

  const handleShowHint = () => {
    if (currentItem) {
      setShowHint(true)
    }
  }

  const handleStart = () => {
    setGameStarted(true)
    setShowWin(false)
  }

  const handlePlayAgain = () => {
    setGameStarted(true)
    setShowWin(false)
    setCurrentIndex(0)
    setScore(0)
    setAttempts(0)
    setUserInput('')
    setShowHint(false)
    setFeedback('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <div className="picture-words-game">
      <div className="picture-header">
        <button onClick={onBackToHub} className="back-button">← Back</button>
        <h1 className="picture-title">Picture Words 🖼️</h1>
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)} 
          className="sound-toggle"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {!gameStarted && (
        <div className="start-overlay">
          <div className="start-content">
            <h2 className="start-title">Picture Words!</h2>
            <p className="start-instructions">
              {config.showChoices 
                ? 'Look at the picture and click the correct word!'
                : 'Look at the picture and type the word!'}
            </p>
            <p className="start-instructions">Match {config.itemCount} pictures to win!</p>
            <button onClick={handleStart} className="start-button">
              Start Game
            </button>
          </div>
        </div>
      )}

      {showWin && (
        <div className="win-overlay">
          <div className="win-content">
            <h2 className="win-title">🎉 Amazing! 🎉</h2>
            <p className="win-message">You matched all the pictures!</p>
            <p className="win-stats">Score: {score}/{items.length}</p>
            <p className="win-stats">Total Attempts: {attempts}</p>
            <div className="win-buttons">
              <button onClick={handlePlayAgain} className="play-again-button">
                Play Again
              </button>
              <button onClick={onBackToHub} className="back-to-hub-button">
                Back to Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {gameStarted && !showWin && currentItem && (
        <>
          <div className="picture-stats">
            <div className="stat-item">
              <span className="stat-label">Progress:</span>
              <span className="stat-value">{currentIndex + 1}/{items.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Score:</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Attempts:</span>
              <span className="stat-value">{attempts}</span>
            </div>
          </div>

          <div className="game-content">
            <div className="image-container">
              <div className="emoji-display">{currentItem.emoji}</div>
            </div>

            <form onSubmit={handleSubmit} className="input-section">
              {!config.showChoices ? (
                <>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    placeholder="Type the word..."
                    className="word-input"
                    autoFocus
                  />
                  <div className="action-buttons">
                    <button type="submit" className="submit-button">
                      Check Answer
                    </button>
                    {!showHint && (
                      <button 
                        type="button" 
                        onClick={handleShowHint} 
                        className="hint-button"
                      >
                        Show Hint
                      </button>
                    )}
                  </div>
                  {showHint && (
                    <div className="hint-display">
                      Hint: First letter is "{currentItem.word[0]}"
                    </div>
                  )}
                </>
              ) : (
                <div className="word-choices">
                  {items.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setUserInput(item.word)
                        setTimeout(() => {
                          const correctAnswer = currentItem.word
                          setAttempts(prev => prev + 1)
                          
                          if (item.word === correctAnswer) {
                            setFeedback('✓ Correct!')
                            setScore(prev => prev + 1)
                            
                            setTimeout(() => {
                              if (currentIndex + 1 >= items.length) {
                                setShowWin(true)
                              } else {
                                setCurrentIndex(prev => prev + 1)
                                setUserInput('')
                                setFeedback('')
                              }
                            }, 1000)
                          } else {
                            setFeedback('✗ Try again!')
                            setTimeout(() => {
                              setUserInput('')
                              setFeedback('')
                            }, 1500)
                          }
                        }, 100)
                      }}
                      className={`choice-button ${userInput === item.word ? 'selected' : ''}`}
                      disabled={feedback !== ''}
                    >
                      {item.word}
                    </button>
                  ))}
                </div>
              )}

              {feedback && (
                <div className={`feedback ${feedback.includes('✓') ? 'correct' : 'incorrect'}`}>
                  {feedback}
                </div>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  )
}

export default PictureWords
