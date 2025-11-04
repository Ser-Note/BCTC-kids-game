import { useState } from 'react'
import Hub from './components/Hub/Hub'
import Memory from './components/Games/Memory/Memory'
import Catch from './components/Games/Catch/Catch'
import Hangman from './components/Games/Hangman/Hangman'
import Runner from './components/Games/Runner/Runner'
import TicTacToe from './components/Games/TicTacToe/TicTacToe'
import WhackAMole from './components/Games/WhackAMole/WhackAMole'
import Snake from './components/Games/Snake/Snake'
import Maze from './components/Games/Maze/Maze'
import RocketMath from './components/Games/RocketMath/RocketMath'
import WordScramble from './components/Games/WordScramble/WordScramble'
import PictureWords from './components/Games/PictureWords/PictureWords'
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
    // Reset all state to prevent white screen bug
    setSelectedGame(null)
    setDifficulty(null)
  }

  // Get game name for difficulty selector
  const getGameName = () => {
    if (selectedGame === 'memory') return 'Memory Match'
    if (selectedGame === 'catch') return 'Catch & Collect'
    if (selectedGame === 'hangman') return 'Hangman'
    if (selectedGame === 'runner') return 'Super Runner'
    if (selectedGame === 'tictactoe') return 'Tic-Tac-Toe'
    if (selectedGame === 'whackamole') return 'Whack-a-Mole'
    if (selectedGame === 'snake') return 'Snake Game'
    if (selectedGame === 'maze') return 'Maze Runner'
    if (selectedGame === 'rocketmath') return 'Rocket Math'
    if (selectedGame === 'wordscramble') return 'Word Scramble'
    if (selectedGame === 'picturewords') return 'Picture Words'
    return ''
  }

  return (
    <div className="app">
      {currentScreen === 'hub' && <Hub onGameSelect={navigateToGame} />}
      {currentScreen === 'memory' && <Memory difficulty={difficulty} onBackToHub={navigateToHub} />}
      {currentScreen === 'catch' && <Catch difficulty={difficulty} onBackToHub={navigateToHub} />}
      {currentScreen === 'hangman' && <Hangman difficulty={difficulty} onBackToHub={navigateToHub} />}
      {currentScreen === 'runner' && <Runner difficulty={difficulty} onBackToHub={navigateToHub} />}
      {currentScreen === 'tictactoe' && <TicTacToe difficulty={difficulty} onBackToHub={navigateToHub} />}
      {currentScreen === 'whackamole' && <WhackAMole difficulty={difficulty} onBackToHub={navigateToHub} />}
      {currentScreen === 'snake' && <Snake difficulty={difficulty} onBackToHub={navigateToHub} />}
      {currentScreen === 'maze' && <Maze difficulty={difficulty} onBackToHub={navigateToHub} />}
      {currentScreen === 'rocketmath' && <RocketMath difficulty={difficulty} onBackToHub={navigateToHub} />}
      {currentScreen === 'wordscramble' && <WordScramble difficulty={difficulty} onBackToHub={navigateToHub} />}
      {currentScreen === 'picturewords' && <PictureWords difficulty={difficulty} onBackToHub={navigateToHub} />}
      
      {/* Show difficulty selector when a game is selected but not started */}
      {selectedGame && !difficulty && currentScreen === 'hub' && (
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
