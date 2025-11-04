import { useState, useEffect, useCallback } from 'react'
import soundPlayer from '../../../utils/sounds'
import { isTouchDevice } from '../../../utils/deviceDetection'
import './RocketMath.css'

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  easy: {
    maxNumber: 5,
    operations: ['addition'],
    questionsToWin: 8,
    timeLimit: null
  },
  medium: {
    maxNumber: 10,
    operations: ['addition', 'subtraction'],
    questionsToWin: 10,
    timeLimit: 60
  },
  hard: {
    maxNumber: 20,
    operations: ['addition', 'subtraction'],
    questionsToWin: 12,
    timeLimit: 45
  }
}

function RocketMath({ difficulty = 'easy', onBackToHub }) {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [rocketHeight, setRocketHeight] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [wrongAnswers, setWrongAnswers] = useState(0)
  
  const config = DIFFICULTY_CONFIG[difficulty]

  const generateQuestion = useCallback(() => {
    const operation = config.operations[Math.floor(Math.random() * config.operations.length)]
    let num1, num2, answer, question
    
    if (operation === 'addition') {
      num1 = Math.floor(Math.random() * config.maxNumber) + 1
      num2 = Math.floor(Math.random() * config.maxNumber) + 1
      answer = num1 + num2
      question = `${num1} + ${num2}`
    } else {
      // Subtraction - ensure no negative answers
      num1 = Math.floor(Math.random() * config.maxNumber) + 1
      num2 = Math.floor(Math.random() * num1) + 1
      answer = num1 - num2
      question = `${num1} - ${num2}`
    }
    
    return { question, answer }
  }, [config])

  const startGame = () => {
    setGameStarted(true)
    setGameWon(false)
    setScore(0)
    setRocketHeight(0)
    setUserAnswer('')
    setFeedback(null)
    setWrongAnswers(0)
    setTimeLeft(config.timeLimit)
    setCurrentQuestion(generateQuestion())
    soundPlayer.playClick()
  }

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || gameWon || !config.timeLimit) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameStarted(false)
          soundPlayer.playNoMatch()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, gameWon, config.timeLimit])

  const checkAnswer = () => {
    const userNum = parseInt(userAnswer)
    
    if (isNaN(userNum)) {
      setFeedback({ correct: false, message: 'Please enter a number!' })
      return
    }
    
    if (userNum === currentQuestion.answer) {
      setScore(prev => prev + 1)
      const newHeight = rocketHeight + (100 / config.questionsToWin)
      setRocketHeight(newHeight)
      setFeedback({ correct: true, message: '🎉 Correct!' })
      soundPlayer.playMatch()
      
      if (score + 1 >= config.questionsToWin) {
        setTimeout(() => {
          setGameWon(true)
          setGameStarted(false)
          soundPlayer.playWin()
        }, 1000)
      } else {
        setTimeout(() => {
          setCurrentQuestion(generateQuestion())
          setUserAnswer('')
          setFeedback(null)
        }, 1500)
      }
    } else {
      setFeedback({ correct: false, message: `❌ Try again! The answer is ${currentQuestion.answer}` })
      setWrongAnswers(prev => prev + 1)
      soundPlayer.playNoMatch()
      
      setTimeout(() => {
        setCurrentQuestion(generateQuestion())
        setUserAnswer('')
        setFeedback(null)
      }, 2000)
    }
  }

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && userAnswer && gameStarted && !feedback) {
      checkAnswer()
    }
  }, [userAnswer, gameStarted, feedback])

  useEffect(() => {
    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [handleKeyPress])

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    soundPlayer.enabled = !soundEnabled
  }

  const rocketBottom = rocketHeight

  return (
    <div className="rocket-math-game">
      <div className="rocket-header">
        <button className="back-button" onClick={onBackToHub}>
          ← Back
        </button>
        <h1 className="rocket-title">🚀 Rocket Math</h1>
        <button className="sound-toggle" onClick={toggleSound}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {gameStarted && (
        <div className="rocket-stats">
          <div className="stat-item">
            <span className="stat-label">Questions:</span>
            <span className="stat-value">{score}/{config.questionsToWin}</span>
          </div>
          {config.timeLimit && (
            <div className="stat-item">
              <span className="stat-label">Time:</span>
              <span className="stat-value">{timeLeft}s</span>
            </div>
          )}
          <div className="stat-item">
            <span className="stat-label">Wrong:</span>
            <span className="stat-value">{wrongAnswers}</span>
          </div>
        </div>
      )}

      <div className="game-container">
        {gameStarted && currentQuestion && (
          <>
            <div className="rocket-track">
              <div className="rocket" style={{ bottom: `${rocketBottom}%` }}>
                🚀
              </div>
              <div className="finish-line">🏁 Finish!</div>
            </div>

            <div className="question-area">
              <div className="question-box">
                <div className="question-text">{currentQuestion.question} = ?</div>
                
                <input
                  type="number"
                  className="answer-input"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type answer"
                  disabled={!!feedback}
                  autoFocus
                />
                
                {!feedback && (
                  <button 
                    className="submit-button"
                    onClick={checkAnswer}
                    disabled={!userAnswer}
                  >
                    Submit ✓
                  </button>
                )}
              </div>

              {feedback && (
                <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
                  {feedback.message}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {!gameStarted && !gameWon && (
        <div className="start-overlay">
          <div className="start-content">
            <h2 className="start-title">Ready to Launch?</h2>
            <p className="start-instructions">
              Solve {config.questionsToWin} math problems to launch your rocket!<br/>
              {config.operations.includes('subtraction') ? 
                'Addition & Subtraction' : 'Addition Only'}<br/>
              {config.timeLimit && `⏱️ ${config.timeLimit} seconds to complete!`}
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
            <h1 className="win-title">🚀 Blast Off! 🚀</h1>
            <p className="win-message">Your rocket reached space!</p>
            <p className="win-stats">Questions Correct: {score}/{config.questionsToWin}</p>
            <p className="win-stats">Wrong Answers: {wrongAnswers}</p>
            {config.timeLimit && timeLeft > 0 && (
              <p className="win-stats">Time Remaining: {timeLeft}s</p>
            )}
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

      {!gameStarted && timeLeft === 0 && (
        <div className="win-overlay">
          <div className="win-content lose-content">
            <h1 className="win-title">⏰ Time's Up!</h1>
            <p className="win-message">Your rocket didn't make it this time!</p>
            <p className="win-stats">Questions Correct: {score}/{config.questionsToWin}</p>
            <div className="win-buttons">
              <button className="play-again-button" onClick={startGame}>
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

export default RocketMath
