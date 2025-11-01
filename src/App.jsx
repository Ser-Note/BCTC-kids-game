import { useState } from 'react'
import Hub from './components/Hub/Hub'
import Memory from './components/Games/Memory/Memory'
import Catch from './components/Games/Catch/Catch'
import DifficultySelector from './components/Shared/DifficultySelector/DifficultySelector'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('hub')
  const [selectedGame, setSelectedGame] = useState(null)
  const [difficulty, setDifficulty] = useState(null)

  const navigateToGame = (gameId) => {
    setSelectedGame(gameId)
    // Show difficulty selector instead of going straight to game
  }

  const handleDifficultySelect = (level) => {
    setDifficulty(level)
    setCurrentScreen(selectedGame)
  }

  const handleDifficultyClose = () => {
    setSelectedGame(null)
  }

  const navigateToHub = () => {
    setCurrentScreen('hub')
    setSelectedGame(null)
    setDifficulty(null)
  }

  // Get game name for difficulty selector
  const getGameName = () => {
    if (selectedGame === 'memory') return 'Memory Match'
    if (selectedGame === 'catch') return 'Catch & Collect'
    return ''
  }

  return (
    <div className="app">
      {currentScreen === 'hub' && <Hub onGameSelect={navigateToGame} />}
      {currentScreen === 'memory' && <Memory difficulty={difficulty} onBackToHub={navigateToHub} />}
      {currentScreen === 'catch' && <Catch difficulty={difficulty} onBackToHub={navigateToHub} />}
      
      {/* Show difficulty selector when a game is selected but not started */}
      {selectedGame && !difficulty && (
        <DifficultySelector 
          gameName={getGameName()}
          onSelect={handleDifficultySelect}
          onClose={handleDifficultyClose}
        />
      )}
    </div>
  )
}

export default App
