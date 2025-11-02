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
