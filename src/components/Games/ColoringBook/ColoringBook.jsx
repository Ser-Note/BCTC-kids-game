import { useState, useEffect, useRef } from 'react'
import './ColoringBook.css'

const ColoringBook = ({ difficulty = 'easy', onBackToHub }) => {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [showWin, setShowWin] = useState(false)
  const [currentColor, setCurrentColor] = useState('#FF6B6B')
  const [coloredRegions, setColoredRegions] = useState({})
  const [completedPictures, setCompletedPictures] = useState(0)
  const [currentPictureIndex, setCurrentPictureIndex] = useState(0)
  const [hoveredRegion, setHoveredRegion] = useState(null)
  const canvasRef = useRef(null)

  const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#FAD7A0',
    '#82E0AA', '#F1948A', '#AED6F1', '#D7BDE2', '#A3E4D7'
  ]

  const DIFFICULTY_CONFIG = {
    easy: {
      picturesCount: 3,
      pictures: [
        { name: 'Heart', regions: ['region1', 'region2'] },
        { name: 'Star', regions: ['region1', 'region2', 'region3'] },
        { name: 'Sun', regions: ['region1', 'region2', 'region3'] }
      ]
    },
    medium: {
      picturesCount: 4,
      pictures: [
        { name: 'Flower', regions: ['region1', 'region2', 'region3', 'region4'] },
        { name: 'House', regions: ['region1', 'region2', 'region3', 'region4'] },
        { name: 'Tree', regions: ['region1', 'region2', 'region3', 'region4', 'region5'] },
        { name: 'Butterfly', regions: ['region1', 'region2', 'region3', 'region4'] }
      ]
    },
    hard: {
      picturesCount: 5,
      pictures: [
        { name: 'Castle', regions: ['region1', 'region2', 'region3', 'region4', 'region5', 'region6'] },
        { name: 'Rainbow', regions: ['region1', 'region2', 'region3', 'region4', 'region5', 'region6', 'region7'] },
        { name: 'Fish', regions: ['region1', 'region2', 'region3', 'region4', 'region5'] },
        { name: 'Car', regions: ['region1', 'region2', 'region3', 'region4', 'region5'] },
        { name: 'Robot', regions: ['region1', 'region2', 'region3', 'region4', 'region5', 'region6'] }
      ]
    }
  }

  const config = DIFFICULTY_CONFIG[difficulty]
  const currentPicture = config.pictures[currentPictureIndex]

  useEffect(() => {
    if (gameStarted && !showWin && canvasRef.current) {
      drawPicture()
    }
  }, [gameStarted, currentPictureIndex, coloredRegions, hoveredRegion])

  const drawPicture = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)

    // Draw based on picture type
    switch (currentPicture.name) {
      case 'Heart':
        drawHeart(ctx, width, height)
        break
      case 'Star':
        drawStar(ctx, width, height)
        break
      case 'Sun':
        drawSun(ctx, width, height)
        break
      case 'Flower':
        drawFlower(ctx, width, height)
        break
      case 'House':
        drawHouse(ctx, width, height)
        break
      case 'Tree':
        drawTree(ctx, width, height)
        break
      case 'Butterfly':
        drawButterfly(ctx, width, height)
        break
      case 'Castle':
        drawCastle(ctx, width, height)
        break
      case 'Rainbow':
        drawRainbow(ctx, width, height)
        break
      case 'Fish':
        drawFish(ctx, width, height)
        break
      case 'Car':
        drawCar(ctx, width, height)
        break
      case 'Robot':
        drawRobot(ctx, width, height)
        break
    }
  }

  // Helper function to get fill color for a region
  const getRegionColor = (regionKey) => {
    if (coloredRegions[regionKey]) {
      return coloredRegions[regionKey]
    }
    if (hoveredRegion === regionKey) {
      return 'rgba(255, 255, 0, 0.3)' // Yellow highlight for hover
    }
    return '#FFF' // White default
  }

  const drawHeart = (ctx, w, h) => {
    const cx = w / 2, cy = h / 2
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    
    // Left side
    ctx.fillStyle = getRegionColor('region1')
    ctx.beginPath()
    ctx.moveTo(cx, cy + h/6)
    ctx.bezierCurveTo(cx - w/3, cy - h/6, cx - w/3, cy + h/6, cx, cy + h/3)
    ctx.fill()
    ctx.stroke()
    
    // Right side
    ctx.fillStyle = getRegionColor('region2')
    ctx.beginPath()
    ctx.moveTo(cx, cy + h/6)
    ctx.bezierCurveTo(cx + w/3, cy - h/6, cx + w/3, cy + h/6, cx, cy + h/3)
    ctx.fill()
    ctx.stroke()
  }

  const drawStar = (ctx, w, h) => {
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 3
    const points = 5
    
    for (let i = 0; i < points; i++) {
      const regionKey = `region${i + 1}`
      ctx.fillStyle = coloredRegions[regionKey] || '#FFF'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 3
      
      ctx.beginPath()
      const angle1 = (i * 2 * Math.PI) / points - Math.PI / 2
      const angle2 = ((i + 1) * 2 * Math.PI) / points - Math.PI / 2
      
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + r * Math.cos(angle1), cy + r * Math.sin(angle1))
      ctx.lineTo(cx + r * 0.4 * Math.cos((angle1 + angle2) / 2), cy + r * 0.4 * Math.sin((angle1 + angle2) / 2))
      ctx.lineTo(cx + r * Math.cos(angle2), cy + r * Math.sin(angle2))
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }

  const drawSun = (ctx, w, h) => {
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 4
    
    // Center circle
    ctx.fillStyle = getRegionColor('region1')
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    // Rays
    const rays = 8
    for (let i = 0; i < rays; i++) {
      const regionKey = `region${(i % 2) + 2}`
      ctx.fillStyle = coloredRegions[regionKey] || '#FFF'
      ctx.beginPath()
      const angle = (i * 2 * Math.PI) / rays
      const nextAngle = ((i + 1) * 2 * Math.PI) / rays
      ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
      ctx.lineTo(cx + r * 1.5 * Math.cos(angle), cy + r * 1.5 * Math.sin(angle))
      ctx.lineTo(cx + r * 1.5 * Math.cos(nextAngle), cy + r * 1.5 * Math.sin(nextAngle))
      ctx.lineTo(cx + r * Math.cos(nextAngle), cy + r * Math.sin(nextAngle))
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }

  const drawFlower = (ctx, w, h) => {
    const cx = w / 2, cy = h / 2.5, r = Math.min(w, h) / 8
    
    // Petals
    const petals = [
      { x: cx, y: cy - r * 1.5, key: 'region1' },
      { x: cx + r * 1.5, y: cy, key: 'region2' },
      { x: cx, y: cy + r * 1.5, key: 'region3' },
      { x: cx - r * 1.5, y: cy, key: 'region4' }
    ]
    
    petals.forEach(petal => {
      ctx.fillStyle = coloredRegions[petal.key] || '#FFF'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(petal.x, petal.y, r, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    })
    
    // Center
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(cx, cy, r / 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  }

  const drawHouse = (ctx, w, h) => {
    const baseY = h * 0.6
    
    // Walls
    ctx.fillStyle = getRegionColor('region1')
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.fillRect(w * 0.2, baseY, w * 0.6, h * 0.35)
    ctx.strokeRect(w * 0.2, baseY, w * 0.6, h * 0.35)
    
    // Roof
    ctx.fillStyle = getRegionColor('region2')
    ctx.beginPath()
    ctx.moveTo(w * 0.15, baseY)
    ctx.lineTo(w * 0.5, h * 0.3)
    ctx.lineTo(w * 0.85, baseY)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Door
    ctx.fillStyle = getRegionColor('region3')
    ctx.fillRect(w * 0.4, baseY + h * 0.15, w * 0.2, h * 0.2)
    ctx.strokeRect(w * 0.4, baseY + h * 0.15, w * 0.2, h * 0.2)
    
    // Window
    ctx.fillStyle = getRegionColor('region4')
    ctx.fillRect(w * 0.65, baseY + h * 0.05, w * 0.1, h * 0.1)
    ctx.strokeRect(w * 0.65, baseY + h * 0.05, w * 0.1, h * 0.1)
  }

  const drawTree = (ctx, w, h) => {
    // Trunk
    ctx.fillStyle = getRegionColor('region1')
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.fillRect(w * 0.4, h * 0.5, w * 0.2, h * 0.4)
    ctx.strokeRect(w * 0.4, h * 0.5, w * 0.2, h * 0.4)
    
    // Leaves (3 circles)
    const leafPositions = [
      { x: w * 0.5, y: h * 0.3, r: w * 0.15, key: 'region2' },
      { x: w * 0.35, y: h * 0.4, r: w * 0.12, key: 'region3' },
      { x: w * 0.65, y: h * 0.4, r: w * 0.12, key: 'region4' }
    ]
    
    leafPositions.forEach(leaf => {
      ctx.fillStyle = coloredRegions[leaf.key] || '#FFF'
      ctx.beginPath()
      ctx.arc(leaf.x, leaf.y, leaf.r, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    })
  }

  const drawButterfly = (ctx, w, h) => {
    const cx = w / 2, cy = h / 2
    
    // Left wings
    ctx.fillStyle = getRegionColor('region1')
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(cx - w * 0.15, cy - h * 0.1, w * 0.15, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    ctx.fillStyle = getRegionColor('region2')
    ctx.beginPath()
    ctx.arc(cx - w * 0.15, cy + h * 0.1, w * 0.12, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    // Right wings
    ctx.fillStyle = getRegionColor('region3')
    ctx.beginPath()
    ctx.arc(cx + w * 0.15, cy - h * 0.1, w * 0.15, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    ctx.fillStyle = getRegionColor('region4')
    ctx.beginPath()
    ctx.arc(cx + w * 0.15, cy + h * 0.1, w * 0.12, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    // Body
    ctx.fillStyle = '#000'
    ctx.fillRect(cx - w * 0.02, cy - h * 0.2, w * 0.04, h * 0.4)
  }

  const drawCastle = (ctx, w, h) => {
    // Main tower
    ctx.fillStyle = getRegionColor('region1')
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.fillRect(w * 0.35, h * 0.3, w * 0.3, h * 0.6)
    ctx.strokeRect(w * 0.35, h * 0.3, w * 0.3, h * 0.6)
    
    // Left tower
    ctx.fillStyle = getRegionColor('region2')
    ctx.fillRect(w * 0.1, h * 0.4, w * 0.2, h * 0.5)
    ctx.strokeRect(w * 0.1, h * 0.4, w * 0.2, h * 0.5)
    
    // Right tower
    ctx.fillStyle = getRegionColor('region3')
    ctx.fillRect(w * 0.7, h * 0.4, w * 0.2, h * 0.5)
    ctx.strokeRect(w * 0.7, h * 0.4, w * 0.2, h * 0.5)
    
    // Roofs
    const roofs = [
      { x: w * 0.2, y: h * 0.4, w: w * 0.2, key: 'region4' },
      { x: w * 0.5, y: h * 0.3, w: w * 0.3, key: 'region5' },
      { x: w * 0.8, y: h * 0.4, w: w * 0.2, key: 'region6' }
    ]
    
    roofs.forEach(roof => {
      ctx.fillStyle = coloredRegions[roof.key] || '#FFF'
      ctx.beginPath()
      ctx.moveTo(roof.x - roof.w / 2, roof.y)
      ctx.lineTo(roof.x, roof.y - h * 0.15)
      ctx.lineTo(roof.x + roof.w / 2, roof.y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    })
  }

  const drawRainbow = (ctx, w, h) => {
    const cx = w / 2
    const colors = ['region1', 'region2', 'region3', 'region4', 'region5', 'region6', 'region7']
    const arcWidth = w * 0.05
    
    colors.forEach((regionKey, i) => {
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.fillStyle = coloredRegions[regionKey] || '#FFF'
      
      const outerRadius = w * 0.4 - i * arcWidth
      const innerRadius = outerRadius - arcWidth
      
      ctx.beginPath()
      ctx.arc(cx, h * 0.8, outerRadius, Math.PI, 0)
      ctx.arc(cx, h * 0.8, innerRadius, 0, Math.PI, true)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    })
  }

  const drawFish = (ctx, w, h) => {
    const cx = w / 2, cy = h / 2
    
    // Body
    ctx.fillStyle = getRegionColor('region1')
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.ellipse(cx, cy, w * 0.25, h * 0.15, 0, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    // Tail
    ctx.fillStyle = getRegionColor('region2')
    ctx.beginPath()
    ctx.moveTo(cx - w * 0.25, cy)
    ctx.lineTo(cx - w * 0.4, cy - h * 0.1)
    ctx.lineTo(cx - w * 0.4, cy + h * 0.1)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Top fin
    ctx.fillStyle = getRegionColor('region3')
    ctx.beginPath()
    ctx.moveTo(cx, cy - h * 0.15)
    ctx.lineTo(cx + w * 0.05, cy - h * 0.25)
    ctx.lineTo(cx + w * 0.1, cy - h * 0.15)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Bottom fin
    ctx.fillStyle = getRegionColor('region4')
    ctx.beginPath()
    ctx.moveTo(cx, cy + h * 0.15)
    ctx.lineTo(cx + w * 0.05, cy + h * 0.25)
    ctx.lineTo(cx + w * 0.1, cy + h * 0.15)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Eye
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(cx + w * 0.15, cy - h * 0.05, w * 0.02, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawCar = (ctx, w, h) => {
    const baseY = h * 0.6
    
    // Body
    ctx.fillStyle = getRegionColor('region1')
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.fillRect(w * 0.2, baseY, w * 0.6, h * 0.2)
    ctx.strokeRect(w * 0.2, baseY, w * 0.6, h * 0.2)
    
    // Roof
    ctx.fillStyle = getRegionColor('region2')
    ctx.fillRect(w * 0.35, baseY - h * 0.15, w * 0.3, h * 0.15)
    ctx.strokeRect(w * 0.35, baseY - h * 0.15, w * 0.3, h * 0.15)
    
    // Windows
    ctx.fillStyle = getRegionColor('region3')
    ctx.fillRect(w * 0.37, baseY - h * 0.13, w * 0.12, h * 0.1)
    ctx.strokeRect(w * 0.37, baseY - h * 0.13, w * 0.12, h * 0.1)
    
    ctx.fillRect(w * 0.51, baseY - h * 0.13, w * 0.12, h * 0.1)
    ctx.strokeRect(w * 0.51, baseY - h * 0.13, w * 0.12, h * 0.1)
    
    // Wheels
    ctx.fillStyle = getRegionColor('region4')
    ctx.beginPath()
    ctx.arc(w * 0.3, baseY + h * 0.2, w * 0.08, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    ctx.fillStyle = getRegionColor('region5')
    ctx.beginPath()
    ctx.arc(w * 0.7, baseY + h * 0.2, w * 0.08, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  }

  const drawRobot = (ctx, w, h) => {
    const cx = w / 2
    
    // Head
    ctx.fillStyle = getRegionColor('region1')
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.fillRect(cx - w * 0.15, h * 0.2, w * 0.3, h * 0.2)
    ctx.strokeRect(cx - w * 0.15, h * 0.2, w * 0.3, h * 0.2)
    
    // Body
    ctx.fillStyle = getRegionColor('region2')
    ctx.fillRect(cx - w * 0.2, h * 0.45, w * 0.4, h * 0.3)
    ctx.strokeRect(cx - w * 0.2, h * 0.45, w * 0.4, h * 0.3)
    
    // Arms
    ctx.fillStyle = getRegionColor('region3')
    ctx.fillRect(cx - w * 0.35, h * 0.5, w * 0.1, h * 0.2)
    ctx.strokeRect(cx - w * 0.35, h * 0.5, w * 0.1, h * 0.2)
    
    ctx.fillStyle = getRegionColor('region4')
    ctx.fillRect(cx + w * 0.25, h * 0.5, w * 0.1, h * 0.2)
    ctx.strokeRect(cx + w * 0.25, h * 0.5, w * 0.1, h * 0.2)
    
    // Legs
    ctx.fillStyle = getRegionColor('region5')
    ctx.fillRect(cx - w * 0.15, h * 0.75, w * 0.1, h * 0.15)
    ctx.strokeRect(cx - w * 0.15, h * 0.75, w * 0.1, h * 0.15)
    
    ctx.fillStyle = getRegionColor('region6')
    ctx.fillRect(cx + w * 0.05, h * 0.75, w * 0.1, h * 0.15)
    ctx.strokeRect(cx + w * 0.05, h * 0.75, w * 0.1, h * 0.15)
    
    // Eyes
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(cx - w * 0.07, h * 0.28, w * 0.03, 0, 2 * Math.PI)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx + w * 0.07, h * 0.28, w * 0.03, 0, 2 * Math.PI)
    ctx.fill()
  }

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (canvas.width / rect.width)
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * (canvas.height / rect.height)

    const clickedRegion = detectRegion(x, y, canvas.width, canvas.height)
    
    if (clickedRegion && currentPicture.regions.includes(clickedRegion)) {
      setColoredRegions(prev => ({
        ...prev,
        [clickedRegion]: currentColor
      }))
    }
  }

  const detectRegion = (x, y, w, h) => {
    // Detailed region detection based on picture type and click coordinates
    const cx = w / 2
    const cy = h / 2
    
    switch (currentPicture.name) {
      case 'Heart':
        // Left side of heart
        if (x < cx) return 'region1'
        // Right side of heart
        return 'region2'
        
      case 'Star':
        // Divide into 5 triangular regions from center
        const angle = Math.atan2(y - cy, x - cx)
        const normalizedAngle = (angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI)
        const segment = Math.floor(normalizedAngle / (2 * Math.PI / 5))
        return `region${segment + 1}`
        
      case 'Sun':
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        const r = Math.min(w, h) / 4
        // Center circle
        if (dist < r) return 'region1'
        // Rays (alternating)
        const rayAngle = Math.atan2(y - cy, x - cx)
        const raySegment = Math.floor(((rayAngle + Math.PI) / (2 * Math.PI)) * 8)
        return raySegment % 2 === 0 ? 'region2' : 'region3'
        
      case 'Flower':
        // Center of flower
        if (Math.abs(x - cx) < w * 0.08 && Math.abs(y - cy / 2.5) < h * 0.08) {
          return null // Center is not colorable
        }
        // Top petal
        if (y < cy / 2.5 - h * 0.075) return 'region1'
        // Right petal
        if (x > cx + w * 0.075) return 'region2'
        // Bottom petal
        if (y > cy / 2.5 + h * 0.075) return 'region3'
        // Left petal
        if (x < cx - w * 0.075) return 'region4'
        return null
        
      case 'House':
        const baseY = h * 0.6
        // Roof (top triangle)
        if (y < baseY && y > h * 0.3) return 'region2'
        // Door
        if (x >= w * 0.4 && x <= w * 0.6 && y >= baseY + h * 0.15) return 'region3'
        // Window
        if (x >= w * 0.65 && x <= w * 0.75 && y >= baseY + h * 0.05 && y <= baseY + h * 0.15) return 'region4'
        // Walls
        if (y >= baseY && y <= baseY + h * 0.35) return 'region1'
        return null
        
      case 'Tree':
        // Trunk
        if (x >= w * 0.4 && x <= w * 0.6 && y >= h * 0.5) return 'region1'
        // Top leaf circle
        if (Math.sqrt((x - cx) ** 2 + (y - h * 0.3) ** 2) < w * 0.15) return 'region2'
        // Left leaf circle
        if (Math.sqrt((x - w * 0.35) ** 2 + (y - h * 0.4) ** 2) < w * 0.12) return 'region3'
        // Right leaf circle
        if (Math.sqrt((x - w * 0.65) ** 2 + (y - h * 0.4) ** 2) < w * 0.12) return 'region4'
        return null
        
      case 'Butterfly':
        // Left top wing
        if (Math.sqrt((x - (cx - w * 0.15)) ** 2 + (y - (cy - h * 0.1)) ** 2) < w * 0.15) return 'region1'
        // Left bottom wing
        if (Math.sqrt((x - (cx - w * 0.15)) ** 2 + (y - (cy + h * 0.1)) ** 2) < w * 0.12) return 'region2'
        // Right top wing
        if (Math.sqrt((x - (cx + w * 0.15)) ** 2 + (y - (cy - h * 0.1)) ** 2) < w * 0.15) return 'region3'
        // Right bottom wing
        if (Math.sqrt((x - (cx + w * 0.15)) ** 2 + (y - (cy + h * 0.1)) ** 2) < w * 0.12) return 'region4'
        return null
        
      case 'Castle':
        const towerBaseY = h * 0.4
        // Left tower
        if (x >= w * 0.1 && x <= w * 0.3 && y >= towerBaseY) return 'region2'
        // Right tower
        if (x >= w * 0.7 && x <= w * 0.9 && y >= towerBaseY) return 'region3'
        // Main tower
        if (x >= w * 0.35 && x <= w * 0.65 && y >= h * 0.3) return 'region1'
        // Left roof
        if (x >= w * 0.05 && x <= w * 0.35 && y < towerBaseY && y > h * 0.25) return 'region4'
        // Center roof
        if (x >= w * 0.35 && x <= w * 0.65 && y < h * 0.3 && y > h * 0.15) return 'region5'
        // Right roof
        if (x >= w * 0.65 && x <= w * 0.95 && y < towerBaseY && y > h * 0.25) return 'region6'
        return null
        
      case 'Rainbow':
        const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - h * 0.8) ** 2)
        const arcWidth = w * 0.05
        const innerRadius = w * 0.4 - 6 * arcWidth
        
        // Check if in rainbow area (above center line)
        if (y > h * 0.8) return null
        
        // Determine which arc
        for (let i = 0; i < 7; i++) {
          const outerR = w * 0.4 - i * arcWidth
          const innerR = outerR - arcWidth
          if (distFromCenter <= outerR && distFromCenter >= innerR) {
            return `region${i + 1}`
          }
        }
        return null
        
      case 'Fish':
        // Body (ellipse)
        const bodyCheck = ((x - cx) ** 2) / (w * 0.25) ** 2 + ((y - cy) ** 2) / (h * 0.15) ** 2
        if (bodyCheck <= 1 && x > cx - w * 0.25) return 'region1'
        // Tail
        if (x < cx - w * 0.25 && y >= cy - h * 0.1 && y <= cy + h * 0.1) return 'region2'
        // Top fin
        if (x >= cx && x <= cx + w * 0.1 && y < cy - h * 0.15 && y > cy - h * 0.25) return 'region3'
        // Bottom fin
        if (x >= cx && x <= cx + w * 0.1 && y > cy + h * 0.15 && y < cy + h * 0.25) return 'region4'
        return null
        
      case 'Car':
        const carBaseY = h * 0.6
        // Windows
        if (y >= carBaseY - h * 0.13 && y <= carBaseY - h * 0.03) {
          if (x >= w * 0.37 && x <= w * 0.49) return 'region3'
          if (x >= w * 0.51 && x <= w * 0.63) return 'region3'
        }
        // Roof
        if (x >= w * 0.35 && x <= w * 0.65 && y >= carBaseY - h * 0.15 && y < carBaseY) return 'region2'
        // Body
        if (x >= w * 0.2 && x <= w * 0.8 && y >= carBaseY && y <= carBaseY + h * 0.2) return 'region1'
        // Left wheel
        if (Math.sqrt((x - w * 0.3) ** 2 + (y - (carBaseY + h * 0.2)) ** 2) < w * 0.08) return 'region4'
        // Right wheel
        if (Math.sqrt((x - w * 0.7) ** 2 + (y - (carBaseY + h * 0.2)) ** 2) < w * 0.08) return 'region5'
        return null
        
      case 'Robot':
        // Head
        if (x >= cx - w * 0.15 && x <= cx + w * 0.15 && y >= h * 0.2 && y <= h * 0.4) return 'region1'
        // Body
        if (x >= cx - w * 0.2 && x <= cx + w * 0.2 && y >= h * 0.45 && y <= h * 0.75) return 'region2'
        // Left arm
        if (x >= cx - w * 0.35 && x <= cx - w * 0.25 && y >= h * 0.5 && y <= h * 0.7) return 'region3'
        // Right arm
        if (x >= cx + w * 0.25 && x <= cx + w * 0.35 && y >= h * 0.5 && y <= h * 0.7) return 'region4'
        // Left leg
        if (x >= cx - w * 0.15 && x <= cx - w * 0.05 && y >= h * 0.75 && y <= h * 0.9) return 'region5'
        // Right leg
        if (x >= cx + w * 0.05 && x <= cx + w * 0.15 && y >= h * 0.75 && y <= h * 0.9) return 'region6'
        return null
        
      default:
        return null
    }
  }

  const handleCanvasHover = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (canvas.width / rect.width)
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * (canvas.height / rect.height)

    const region = detectRegion(x, y, canvas.width, canvas.height)
    setHoveredRegion(region)
  }

  const handleCanvasLeave = () => {
    setHoveredRegion(null)
  }

  const handleNextPicture = () => {
    const allRegionsColored = currentPicture.regions.every(region => coloredRegions[region])
    
    if (allRegionsColored) {
      setCompletedPictures(prev => prev + 1)
      
      if (currentPictureIndex + 1 >= config.picturesCount) {
        setShowWin(true)
      } else {
        setCurrentPictureIndex(prev => prev + 1)
        setColoredRegions({})
      }
    }
  }

  const isComplete = currentPicture.regions.every(region => coloredRegions[region])

  const handleStart = () => {
    setGameStarted(true)
    setShowWin(false)
    setColoredRegions({})
    setCurrentPictureIndex(0)
    setCompletedPictures(0)
  }

  const handlePlayAgain = () => {
    handleStart()
  }

  return (
    <div className="coloring-book-game">
      <div className="coloring-header">
        <button onClick={onBackToHub} className="back-button">← Back</button>
        <h1 className="coloring-title">Coloring Book 🎨</h1>
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)} 
          className="sound-toggle"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {!gameStarted && (
        <div className="start-overlay">
          <div className="start-content">
            <h2 className="start-title">Coloring Book!</h2>
            <p className="start-instructions">
              Click on different parts of the picture to color them in!
            </p>
            <p className="start-instructions">
              Complete {config.picturesCount} pictures to win!
            </p>
            <button onClick={handleStart} className="start-button">
              Start Coloring
            </button>
          </div>
        </div>
      )}

      {showWin && (
        <div className="win-overlay">
          <div className="win-content">
            <h2 className="win-title">🎨 Beautiful! 🎨</h2>
            <p className="win-message">You colored all the pictures!</p>
            <p className="win-stats">Completed: {completedPictures}/{config.picturesCount}</p>
            <div className="win-buttons">
              <button onClick={handlePlayAgain} className="play-again-button">
                Color More
              </button>
              <button onClick={onBackToHub} className="back-to-hub-button">
                Back to Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {gameStarted && !showWin && (
        <>
          <div className="coloring-stats">
            <div className="stat-item">
              <span className="stat-label">Picture:</span>
              <span className="stat-value">{currentPictureIndex + 1}/{config.picturesCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed:</span>
              <span className="stat-value">{completedPictures}</span>
            </div>
          </div>

          <div className="coloring-area">
            <div className="canvas-container">
              <h3 className="picture-name">{currentPicture.name}</h3>
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                onClick={handleCanvasClick}
                onTouchStart={handleCanvasClick}
                onMouseMove={handleCanvasHover}
                onMouseLeave={handleCanvasLeave}
                className="coloring-canvas"
              />
            </div>

            <div className="controls">
              <div className="color-palette">
                <h3 className="palette-title">Colors</h3>
                <div className="colors-grid">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setCurrentColor(color)}
                      className={`color-button ${currentColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {isComplete && (
                <button onClick={handleNextPicture} className="next-button">
                  {currentPictureIndex + 1 >= config.picturesCount ? 'Finish!' : 'Next Picture →'}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ColoringBook
