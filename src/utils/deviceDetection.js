// Device detection utilities
export const isTouchDevice = () => {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
}

export const isMobileDevice = () => {
  return isTouchDevice() && window.innerWidth <= 1024
}

export const isTabletDevice = () => {
  return isTouchDevice() && window.innerWidth > 768 && window.innerWidth <= 1024
}

export const getDeviceType = () => {
  if (!isTouchDevice()) return 'desktop'
  if (window.innerWidth <= 768) return 'mobile'
  if (window.innerWidth <= 1024) return 'tablet'
  return 'desktop'
}
