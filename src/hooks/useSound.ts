import { useState, useEffect, useCallback } from 'react'

export const useSound = (
  src: string,
  { volume = 0.10, playbackRate = 1, soundEnabled = true } = {}
) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    const newAudio = new Audio(src)
    setAudio(newAudio)

    return () => {
      newAudio.pause()
    }
  }, [src])

  useEffect(() => {
    if (audio) {
      audio.volume = volume
      audio.playbackRate = playbackRate
    }
  }, [audio, volume, playbackRate])

  const play = useCallback(() => {
    if (audio && soundEnabled) {
      audio.currentTime = 0
      audio.play().catch((error) => {
        console.error('Audio play failed:', error)
      })
    }
  }, [audio, soundEnabled])

  return [play]
}
