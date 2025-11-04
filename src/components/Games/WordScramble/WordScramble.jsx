import { useState, useEffect, useCallback } from 'react'
import soundPlayer from '../../../utils/sounds'
import { isTouchDevice } from '../../../utils/deviceDetection'
import './WordScramble.css'

// Word lists by difficulty
const WORD_LISTS = {
  easy: ['CAT', 'DOG', 'SUN', 'BUS', 'HAT', 'BAT', 'CUP', 'PIG', 'RAT', 'BED'],
  medium: ['TREE', 'FISH', 'BIRD', 'FROG', 'STAR', 'MOON', 'DUCK', 'BEAR', 'LION', 'BOAT'],
  hard: ['APPLE', 'TIGER', 'HOUSE', 'SNAKE', 'HORSE', 'RIVER', 'OCEAN', 'PLANT', 'SHEEP', 'WHALE']
}

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  easy: {
    wordsToMatch: 6,
    showHints: true
  },
  medium: {
    wordsToMatch: 8,
    showHints: false
  },
  hard: {
    wordsToMatch: 10,
    showHints: false
  }
}

function WordScramble({ difficulty = 'easy', onBackToHub }) {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [scrambledWords, setScrambledWords] = useState([])
  const [correctWords, setCorrectWords] = useState([])
  const [matches, setMatches] = useState({})
  const [selectedScrambled, setSelectedScrambled] = useState(null)
  const [selectedCorrect, setSelectedCorrect] = useState(null)
  const [score, setScore] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  const config = DIFFICULTY_CONFIG[difficulty]
  const wordList = WORD_LISTS[difficulty]

  const scrambleWord = (word) => {
    const letters = word.split('')
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[letters[i], letters[j]] = [letters[j], letters[i]]
    }
    // Ensure it's actually scrambled
    const scrambled = letters.join('')
    return scrambled === word ? scrambleWord(word) : scrambled
  }

  const startGame = () => {
    // Select random words
    const shuffled = [...wordList].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, config.wordsToMatch)
    
    // Create scrambled versions
    const scrambled = selected.map((word, index) => ({
      id: `scrambled-${index}`,
      word: scrambleWord(word),
      originalWord: word,
      matched: false
    }))
    
    // Create correct word list in different order
    const correct = [...selected].sort(() => Math.random() - 0.5).map((word, index) => ({
      id: `correct-${index}`,
      word: word,
      matched: false
    }))
    
    setScrambledWords(scrambled)
    setCorrectWords(correct)
    setMatches({})
    setSelectedScrambled(null)
    setSelectedCorrect(null)
    setScore(0)
    setGameStarted(true)
    setGameWon(false)
    soundPlayer.playClick()
  }

  const handleScrambledClick = (scrambledItem) => {
    if (scrambledItem.matched) return
    
    soundPlayer.playFlip()
    
    if (selectedScrambled?.id === scrambledItem.id) {
      setSelectedScrambled(null)
    } else {
      setSelectedScrambled(scrambledItem)
      
      if (selectedCorrect) {
        checkMatch(scrambledItem, selectedCorrect)
      }
    }
  }

  const handleCorrectClick = (correctItem) => {
    if (correctItem.matched) return
    
    soundPlayer.playFlip()
    
    if (selectedCorrect?.id === correctItem.id) {
      setSelectedCorrect(null)
    } else {
      setSelectedCorrect(correctItem)
      
      if (selectedScrambled) {
        checkMatch(selectedScrambled, correctItem)
      }
    }
  }

  const checkMatch = (scrambled, correct) => {
    if (scrambled.originalWord === correct.word) {
      // Correct match!
      setMatches(prev => ({
        ...prev,
        [scrambled.id]: correct.id
      }))
      
      setScrambledWords(prev => 
        prev.map(item => 
          item.id === scrambled.id ? { ...item, matched: true } : item
        )
      )
      
      setCorrectWords(prev => 
        prev.map(item => 
          item.id === correct.id ? { ...item, matched: true } : item
        )
      )
      
      setScore(prev => prev + 1)
      soundPlayer.playMatch()
      
      setSelectedScrambled(null)
      setSelectedCorrect(null)
      
      // Check if game is won
      if (score + 1 >= config.wordsToMatch) {
        setTimeout(() => {
          setGameWon(true)
          setGameStarted(false)
          soundPlayer.playWin()
        }, 500)
      }
    } else {
      // Wrong match
      soundPlayer.playNoMatch()
      setTimeout(() => {
        setSelectedScrambled(null)
        setSelectedCorrect(null)
      }, 800)
    }
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    soundPlayer.enabled = !soundEnabled
  }

  const isConnected = (scrambledId, correctId) => {
    return matches[scrambledId] === correctId
  }

  return (
    <div className="word-scramble-game">
      <div className="scramble-header">
        <button className="back-button" onClick={onBackToHub}>
          ← Back
        </button>
        <h1 className="scramble-title">🔤 Word Scramble</h1>
        <button className="sound-toggle" onClick={toggleSound}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {gameStarted && (
        <div className="scramble-stats">
          <div className="stat-item">
            <span className="stat-label">Matched:</span>
            <span className="stat-value">{score}/{config.wordsToMatch}</span>
          </div>
        </div>
      )}

      {gameStarted && (
        <div className="game-board">
          <div className="scrambled-column">
            <h2 className="column-title">Scrambled Words</h2>
            <div className="words-list">
              {scrambledWords.map(item => (
                <button
                  key={item.id}
                  className={`word-card scrambled ${
                    item.matched ? 'matched' : ''
                  } ${selectedScrambled?.id === item.id ? 'selected' : ''}`}
                  onClick={() => handleScrambledClick(item)}
                  disabled={item.matched}
                >
                  {item.word}
                  {config.showHints && (
                    <div className="hint">({item.originalWord.charAt(0)}...)</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="connector-area">
            <div className="instructions">
              {selectedScrambled || selectedCorrect ? (
                <span>Click a match!</span>
              ) : (
                <span>Click words to match!</span>
              )}
            </div>
          </div>

          <div className="correct-column">
            <h2 className="column-title">Correct Words</h2>
            <div className="words-list">
              {correctWords.map(item => (
                <button
                  key={item.id}
                  className={`word-card correct ${
                    item.matched ? 'matched' : ''
                  } ${selectedCorrect?.id === item.id ? 'selected' : ''}`}
                  onClick={() => handleCorrectClick(item)}
                  disabled={item.matched}
                >
                  {item.word}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!gameStarted && !gameWon && (
        <div className="start-overlay">
          <div className="start-content">
            <h2 className="start-title">Ready to Unscramble?</h2>
            <p className="start-instructions">
              Match {config.wordsToMatch} scrambled words to their correct spelling!<br/>
              Click a scrambled word, then click its correct match!<br/>
              {config.showHints && '💡 Hints show the first letter!'}
            </p>
            <button className="start-button" onClick={startGame}>
              Start Game!
            </button>
          </div>
        </div>
      )}

      {gameWon && (
        <div className="win-overlay">
          <div className="win-content">
            <h1 className="win-title">🎉 Perfect Match! 🎉</h1>
            <p className="win-message">You unscrambled all the words!</p>
            <p className="win-stats">Words Matched: {score}/{config.wordsToMatch}</p>
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

export default WordScramble
