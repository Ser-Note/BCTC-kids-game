import soundPlayer from '../../utils/sounds'
import './Hub.css'

function Hub({ onGameSelect }) {
  const games = [
    { id: 'memory', title: 'Memory Match', color: '#FF6B6B', icon: '🎴' },
    { id: 'catch', title: 'Catch & Collect', color: '#4ECDC4', icon: '🎯' },
    { id: 'hangman', title: 'Hangman', color: '#95E1D3', icon: '✏️' },
    { id: 'runner', title: 'Super Runner', color: '#FFE66D', icon: '🏃' },
    { id: 'tictactoe', title: 'Tic-Tac-Toe', color: '#A78BFA', icon: '⭕' },
    { id: 'whackamole', title: 'Whack-a-Mole', color: '#F59E42', icon: '🔨' },
    { id: 'snake', title: 'Snake Game', color: '#81C784', icon: '🐍' },
    { id: 'maze', title: 'Maze Runner', color: '#9C88FF', icon: '🧩' },
    { id: 'rocketmath', title: 'Rocket Math', color: '#0a0e27', icon: '🚀' },
    { id: 'wordscramble', title: 'Word Scramble', color: '#f093fb', icon: '🔤' },
    { id: 'picturewords', title: 'Picture Words', color: '#667eea', icon: '🖼️' },
  ]

  const handleGameClick = (gameId) => {
    soundPlayer.playClick()
    onGameSelect(gameId)
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
