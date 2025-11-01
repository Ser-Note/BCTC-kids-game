import { useState, useEffect } from 'react'
import Card from './Card'
import soundPlayer from '../../../utils/sounds'
import './Memory.css'

// Card images - using emojis for now, you can replace with images later
const CARD_IMAGES = ['🐶', '🐱', '🐼', '🦁', '🐸', '🐰', '🐵', '🐯']

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  easy: {
    pairs: 3,
    gridCols: 3,
    shuffle: false,
    moveLimit: null,
    previewTime: 3000,
    shuffleSpeed: 0
  },
  medium: {
    pairs: 3,
    gridCols: 3,
    shuffle: true,
    moveLimit: null,
    previewTime: 3000,
    shuffleSpeed: 2000 // 2 seconds - slow, visible shuffling
  },
  hard: {
    pairs: 8,
    gridCols: 4,
    shuffle: true,
    moveLimit: 20,
    previewTime: 4000,
    shuffleSpeed: 600 // 0.6 seconds - super fast!
  }
}

function Memory({ difficulty = 'easy', onBackToHub }) {
  const [cards, setCards] = useState([])
  const [flippedIndices, setFlippedIndices] = useState([])
  const [matchedPairs, setMatchedPairs] = useState([])
  const [showAll, setShowAll] = useState(true)
  const [canFlip, setCanFlip] = useState(false)
  const [moves, setMoves] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isShuffling, setIsShuffling] = useState(false)

  const config = DIFFICULTY_CONFIG[difficulty]

  // Initialize game
  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    // Create pairs of cards based on difficulty
    const cardPairs = CARD_IMAGES.slice(0, config.pairs).flatMap((image, idx) => [
      { id: idx * 2, image, pairId: idx },
      { id: idx * 2 + 1, image, pairId: idx }
    ])
    
    // Shuffle cards
    const shuffled = cardPairs.sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setMatchedPairs([])
    setFlippedIndices([])
    setMoves(0)
    setShowAll(true)
    setCanFlip(false)
    setIsShuffling(false)

    // Show all cards for configured time
    setTimeout(() => {
      setShowAll(false)
      
      // If shuffle is enabled, shuffle the cards with animation
      if (config.shuffle) {
        setIsShuffling(true)
        
        // Perform multiple shuffle steps for visual effect
        const shuffleSteps = config.shuffleSpeed > 1000 ? 5 : 3 // More steps for slower shuffle
        const stepDelay = config.shuffleSpeed / shuffleSteps
        
        let currentCards = [...shuffled]
        for (let i = 0; i < shuffleSteps; i++) {
          setTimeout(() => {
            currentCards = [...currentCards].sort(() => Math.random() - 0.5)
            setCards([...currentCards])
          }, stepDelay * i)
        }
        
        setTimeout(() => {
          setIsShuffling(false)
          setCanFlip(true)
        }, config.shuffleSpeed)
      } else {
        setCanFlip(true)
      }
    }, config.previewTime)
  }

  const handleCardClick = (index) => {
    if (!canFlip) return
    if (flippedIndices.includes(index)) return
    if (matchedPairs.includes(cards[index].pairId)) return
    if (flippedIndices.length === 2) return
    if (isGameLost) return

    // Play flip sound
    soundPlayer.playFlip()

    const newFlipped = [...flippedIndices, index]
    setFlippedIndices(newFlipped)

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      setMoves(moves + 1)
      setCanFlip(false)

      const [firstIdx, secondIdx] = newFlipped
      const firstCard = cards[firstIdx]
      const secondCard = cards[secondIdx]

      if (firstCard.pairId === secondCard.pairId) {
        // Match found!
        soundPlayer.playMatch()
        setTimeout(() => {
          setMatchedPairs([...matchedPairs, firstCard.pairId])
          setFlippedIndices([])
          setCanFlip(true)
        }, 800)
      } else {
        // No match, flip back
        soundPlayer.playNoMatch()
        setTimeout(() => {
          setFlippedIndices([])
          setCanFlip(true)
        }, 1200)
      }
    }
  }

  // Check if game is won
  const isGameWon = matchedPairs.length === config.pairs
  
  // Check if game is lost (only for hard mode with move limit)
  const isGameLost = config.moveLimit && moves >= config.moveLimit && !isGameWon

  // Play win sound when game is won
  useEffect(() => {
    if (isGameWon) {
      soundPlayer.playWin()
    }
  }, [isGameWon])

  const toggleSound = () => {
    const newState = soundPlayer.toggle()
    setSoundEnabled(newState)
  }

  return (
    <div className="memory-game">
      <div className="memory-header">
        <button className="back-button" onClick={onBackToHub}>
          ← Back
        </button>
        <h1 className="memory-title">Memory Match</h1>
        <div className="header-right">
          <button 
            className="sound-toggle" 
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <div className="memory-stats">
            {config.moveLimit ? (
              <span className={moves >= config.moveLimit ? 'limit-reached' : ''}>
                Moves: {moves}/{config.moveLimit}
              </span>
            ) : (
              <span>Moves: {moves}</span>
            )}
          </div>
        </div>
      </div>

      {showAll && (
        <div className="countdown-overlay">
          <h2 className="countdown-text">Remember the animals! 👀</h2>
        </div>
      )}

      {isShuffling && (
        <div className="countdown-overlay">
          <h2 className="countdown-text">Shuffling... 🔀</h2>
        </div>
      )}

      <div 
        className={`cards-grid ${isShuffling ? 'shuffling' : ''}`}
        style={{ gridTemplateColumns: `repeat(${config.gridCols}, 1fr)` }}
      >
        {cards.map((card, index) => (
          <Card
            key={card.id}
            image={card.image}
            isFlipped={showAll || flippedIndices.includes(index) || matchedPairs.includes(card.pairId)}
            isMatched={matchedPairs.includes(card.pairId)}
            isShuffling={isShuffling}
            onClick={() => handleCardClick(index)}
          />
        ))}
      </div>

      {isGameWon && (
        <div className="win-overlay">
          <div className="win-content">
            <h1 className="win-title">🎉 You Win! 🎉</h1>
            <p className="win-message">Great job matching all the animals!</p>
            <p className="win-stats">You did it in {moves} moves!</p>
            <div className="win-buttons">
              <button className="play-again-button" onClick={initializeGame}>
                Play Again
              </button>
              <button className="back-to-hub-button" onClick={onBackToHub}>
                Choose Another Game
              </button>
            </div>
          </div>
        </div>
      )}

      {isGameLost && (
        <div className="win-overlay">
          <div className="win-content lose-content">
            <h1 className="win-title lose-title">😢 Out of Moves!</h1>
            <p className="win-message">You used all {config.moveLimit} moves!</p>
            <p className="win-stats">Try again!</p>
            <div className="win-buttons">
              <button className="play-again-button" onClick={initializeGame}>
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

export default Memory
