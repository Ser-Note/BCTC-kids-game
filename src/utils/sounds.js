// Simple sound effect player using Web Audio API and oscillators
// For production, you'd replace these with actual audio files

class SoundPlayer {
  constructor() {
    this.audioContext = null
    this.enabled = true
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
  }

  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled) return
    
    this.init()
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.value = frequency
    oscillator.type = type
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // Card flip sound - quick ascending tone
  playFlip() {
    this.init()
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1)
    oscillator.type = 'triangle'
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)
    
    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.1)
  }

  // Match found - happy ascending notes
  playMatch() {
    const notes = [523.25, 659.25, 783.99] // C, E, G
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine'), i * 100)
    })
  }

  // No match - descending sad tone
  playNoMatch() {
    this.init()
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3)
    oscillator.type = 'sawtooth'
    
    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)
    
    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.3)
  }

  // Win - celebration melody
  playWin() {
    const melody = [
      { freq: 523.25, time: 0 },    // C
      { freq: 659.25, time: 150 },  // E
      { freq: 783.99, time: 300 },  // G
      { freq: 1046.50, time: 450 }, // C (high)
    ]
    
    melody.forEach(({ freq, time }) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sine'), time)
    })
  }

  // Button click
  playClick() {
    this.playTone(800, 0.05, 'square')
  }

  toggle() {
    this.enabled = !this.enabled
    return this.enabled
  }

  setEnabled(enabled) {
    this.enabled = enabled
  }
}

// Create a singleton instance
const soundPlayer = new SoundPlayer()

export default soundPlayer
