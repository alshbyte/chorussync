let audioCtx: AudioContext | null = null
let oscillator: OscillatorNode | null = null
let gainNode: GainNode | null = null

const SA_FREQUENCIES: Record<string, number> = {
  C: 261.63,
  'C#': 277.18,
  D: 293.66,
  'D#': 311.13,
  E: 329.63,
  F: 349.23,
  'F#': 369.99,
  G: 392.0,
  'G#': 415.3,
  A: 440.0,
  'A#': 466.16,
  B: 493.88,
}

export const SA_KEYS = Object.keys(SA_FREQUENCIES)

export function startDrone(key: string = 'C') {
  if (oscillator) stopDrone()
  audioCtx = new AudioContext()
  oscillator = audioCtx.createOscillator()
  gainNode = audioCtx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = SA_FREQUENCIES[key] || 261.63
  gainNode.gain.value = 0
  oscillator.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  gainNode.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.5)
  oscillator.start()
}

export function stopDrone() {
  if (gainNode && audioCtx) {
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3)
  }
  setTimeout(() => {
    oscillator?.stop()
    oscillator?.disconnect()
    gainNode?.disconnect()
    audioCtx?.close()
    oscillator = null
    gainNode = null
    audioCtx = null
  }, 400)
}

export function isDronePlaying() {
  return oscillator !== null
}
