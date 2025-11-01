import soundPlayer from '../../utils/sounds'
import './Hub.css'

function Hub({ onGameSelect }) {
  const games = [
    { id: 'memory', title: 'Memory Match', color: '#FF6B6B', icon: '🎴' },
    { id: 'catch', title: 'Catch & Collect', color: '#4ECDC4', icon: '🎯' },
    { id: 'colors', title: 'Color Sort', color: '#95E1D3', icon: '🎨' },
    { id: 'puzzle', title: 'Puzzle Fun', color: '#FFE66D', icon: '🧩' },
  ]

  const handleGameClick = (gameId) => {
    soundPlayer.playClick()
    if (gameId === 'memory' || gameId === 'catch') {
      onGameSelect(gameId)
    } else {
      alert('This game is coming soon! 🎮')
    }
  }

  return (
    <div className="hub">
      <div className="hub-header">
        <h1 className="hub-title">🌟 Let's Play! 🌟</h1>
        <p className="hub-subtitle">Choose a game to start</p>
      </div>
      
      <div className="games-grid">
        {games.map((game) => (
          <button
            key={game.id}
            className="game-card"
            style={{ backgroundColor: game.color }}
            onClick={() => handleGameClick(game.id)}
          >
            <div className="game-icon">{game.icon}</div>
            <h2 className="game-title">{game.title}</h2>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Hub
