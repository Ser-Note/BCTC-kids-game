import './DifficultySelector.css'
import soundPlayer from '../../../utils/sounds'

function DifficultySelector({ gameName, onSelect, onClose }) {
  // Different descriptions for each game
  const gameDescriptions = {
    'Memory Match': {
      easy: '2x3 grid • See the cards',
      medium: '2x3 grid • Cards shuffle!',
      hard: '4x4 grid • Shuffle • 10 moves!'
    },
    'Catch & Collect': {
      easy: 'Slow speed • 5 lives • Endless',
      medium: 'Faster • 3 lives • Endless',
      hard: 'Super fast! • 1 life • Endless'
    },
    'Hangman': {
      easy: 'Short words • 8 tries • Hint 🎁',
      medium: '5-letter words • 6 tries',
      hard: 'Long words • Only 4 tries!'
    },
    'Super Runner': {
      easy: 'Slow pace • Easy jumps',
      medium: 'Faster • More obstacles',
      hard: 'Super speed • Expert only!'
    },
    'Tic-Tac-Toe': {
      easy: 'Bot makes mistakes',
      medium: 'Smart bot • Some strategy',
      hard: 'Unbeatable AI! 🤖'
    },
    'Whack-a-Mole': {
      easy: '3x3 grid • Slow • No bombs',
      medium: '4x4 grid • Faster • Some 💣',
      hard: '5x5 grid • Very fast • Many 💣'
    },
    'Snake Game': {
      easy: 'Slow snake • Start length 3',
      medium: 'Faster • Start length 5',
      hard: 'Very fast! • Start length 7'
    },
    'Maze Runner': {
      easy: '9x9 maze • 3 collectibles ⭐',
      medium: '13x13 maze • 5 collectibles',
      hard: '17x17 maze • 7 collectibles'
    },
    'Rocket Math': {
      easy: 'Numbers 1-5 • Addition • 8 Qs',
      medium: 'Numbers 1-10 • +/− • 60s timer',
      hard: 'Numbers 1-20 • +/− • 45s timer'
    },
    'Word Scramble': {
      easy: '3-letter words • 6 matches • Hint',
      medium: '4-letter words • 8 matches',
      hard: '5-letter words • 10 matches'
    },
    'Picture Words': {
      easy: '3-letter words • Click choice',
      medium: '4-letter words • Type it!',
      hard: '5-6 letter words • Type it!'
    }
  }

  const descriptions = gameDescriptions[gameName] || gameDescriptions['Memory Match']

  const levels = [
    {
      id: 'easy',
      name: 'Easy',
      color: '#95E1D3',
      icon: '😊',
      description: descriptions.easy
    },
    {
      id: 'medium',
      name: 'Medium',
      color: '#FFE66D',
      icon: '😎',
      description: descriptions.medium
    },
    {
      id: 'hard',
      name: 'Hard',
      color: '#FF6B6B',
      icon: '🔥',
      description: descriptions.hard
    }
  ]

  const handleSelect = (level) => {
    soundPlayer.playClick()
    onSelect(level)
  }

  const handleClose = () => {
    soundPlayer.playClick()
    onClose()
  }

  return (
    <div className="difficulty-overlay">
      <div className="difficulty-modal">
        <button className="close-button" onClick={handleClose}>✕</button>
        
        <h1 className="difficulty-title">{gameName}</h1>
        <h2 className="difficulty-subtitle">Choose Your Level</h2>
        
        <div className="levels-container">
          {levels.map((level) => (
            <button
              key={level.id}
              className="level-card"
              style={{ backgroundColor: level.color }}
              onClick={() => handleSelect(level.id)}
            >
              <div className="level-icon">{level.icon}</div>
              <h3 className="level-name">{level.name}</h3>
              <p className="level-description">{level.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DifficultySelector
