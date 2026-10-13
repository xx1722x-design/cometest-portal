import { useState, useEffect } from 'react'

export function VolumeControl() {
  const [volume, setVolume] = useState(100)
  const [isHovering, setIsHovering] = useState(false)

  // Load saved volume on mount
  useEffect(() => {
    const saved = localStorage.getItem('portal-volume')
    if (saved) {
      setVolume(parseInt(saved, 10))
    }
  }, [])

  // Save volume to localStorage
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    localStorage.setItem('portal-volume', newVolume.toString())

    // Apply to any audio/video elements on the page
    const audioElements = document.querySelectorAll('audio, video')
    audioElements.forEach((el: any) => {
      el.volume = newVolume / 100
    })
  }

  // Get volume icon based on level
  const getVolumeIcon = () => {
    if (volume === 0) return '🔇'
    if (volume < 33) return '🔈'
    if (volume < 67) return '🔉'
    return '🔊'
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        backgroundColor: isHovering ? 'rgba(100, 181, 246, 0.15)' : 'rgba(100, 181, 246, 0.08)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Volume Icon */}
      <span style={{ fontSize: '18px', minWidth: '24px', textAlign: 'center' }}>
        {getVolumeIcon()}
      </span>

      {/* Volume Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(e) => handleVolumeChange(Number(e.target.value))}
        style={{
          width: isHovering ? '120px' : '80px',
          height: '4px',
          cursor: 'pointer',
          transition: 'width 0.3s ease',
          appearance: 'none',
          background: `linear-gradient(to right, rgba(100, 181, 246, 0.6) 0%, rgba(100, 181, 246, 0.6) ${volume}%, rgba(100, 181, 246, 0.2) ${volume}%, rgba(100, 181, 246, 0.2) 100%)`,
          borderRadius: '4px',
          border: 'none',
          outline: 'none',
          accentColor: 'rgba(100, 181, 246, 0.8)',
        } as any}
        title={`Volume: ${volume}%`}
      />

      {/* Volume Level Display */}
      {isHovering && (
        <span
          style={{
            fontSize: '12px',
            color: 'rgba(100, 181, 246, 0.8)',
            minWidth: '30px',
            textAlign: 'right',
            fontWeight: '500',
          }}
        >
          {volume}%
        </span>
      )}
    </div>
  )
}
