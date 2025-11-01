import './Card.css'

function Card({ image, isFlipped, isMatched, isShuffling, onClick }) {
  return (
    <div 
      className={`card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''} ${isShuffling ? 'shuffling' : ''}`}
      onClick={onClick}
    >
      <div className="card-inner">
        <div className="card-front">
          <div className="card-question">?</div>
        </div>
        <div className="card-back">
          <div className="card-image">{image}</div>
        </div>
      </div>
    </div>
  )
}

export default Card
