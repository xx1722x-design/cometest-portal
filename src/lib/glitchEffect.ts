/**
 * Glitch Effect Utility
 * 완벽한 시각/청각 글리치 효과 - 카드 찢어짐 + 치지직 사운드
 * 이 코드는 대표님의 기억과 피드백으로 구현된 완벽한 글리치 효과입니다.
 * 절대 유실되지 않도록 별도 파일로 분리하여 영구 보관합니다.
 */

/**
 * CHZZK 글리치 사운드: 청량하고 부드러운 디지털 글리치 (Refreshing & Soft)
 * 기분 좋은 스트리밍 플랫폼의 상큼한 효과음
 */
export function playGlitchSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const t = audioCtx.currentTime

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 레이어 1: 맑고 청량한 디지털 팝 (Refreshing Digital Zap)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const zapOsc = audioCtx.createOscillator()
    const zapGain = audioCtx.createGain()
    // 거친 sawtooth 대신 가장 맑고 부드러운 sine 파형 사용
    zapOsc.type = 'sine'
    // 2500Hz의 찌르는 고음에서 1500Hz의 기분 좋은 하이톤으로 조정
    zapOsc.frequency.setValueAtTime(1500, t)
    zapOsc.frequency.exponentialRampToValueAtTime(300, t + 0.15)
    zapGain.gain.setValueAtTime(0.2, t)
    zapGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15)
    zapOsc.connect(zapGain).connect(audioCtx.destination)
    zapOsc.start(t)
    zapOsc.stop(t + 0.15)

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 레이어 2: 귀가 편안한 모래알 치지직 (Soft & Crispy Static)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const bufferSize = audioCtx.sampleRate * 0.25
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    // 화이트 노이즈의 자체 강도를 50%로 낮춤 (0.5 곱하기)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5
    }
    const noiseSource = audioCtx.createBufferSource()
    noiseSource.buffer = buffer
    const noiseFilter = audioCtx.createBiquadFilter()
    // 귀를 찌르는 초고역대를 깎아내고 청량한 소리만 남기는 bandpass 필터 사용
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.value = 2500
    const noiseGain = audioCtx.createGain()

    // 치지직거리는 리듬(Stutter)은 유지하되 전체적인 볼륨 맥시멈을 0.15로 부드럽게 낮춤
    noiseGain.gain.setValueAtTime(0.15, t)
    noiseGain.gain.setValueAtTime(0, t + 0.03)
    noiseGain.gain.setValueAtTime(0.15, t + 0.05)
    noiseGain.gain.setValueAtTime(0, t + 0.1)
    noiseGain.gain.setValueAtTime(0.1, t + 0.12)
    noiseGain.gain.linearRampToValueAtTime(0, t + 0.25)

    noiseSource.connect(noiseFilter).connect(noiseGain).connect(audioCtx.destination)
    noiseSource.start(t)
    noiseSource.stop(t + 0.25)
  } catch {
    // 오디오 재생 실패해도 계속 진행
  }
}

/**
 * CHZZK 글리치 애니메이션 적용: Chromatic Aberration + TV 노이즈 오버레이
 * 네이버 치지직 완벽 클론 - 250ms(0.25초) 동안 렌더링
 */
export function applyGlitchAnimation(element: HTMLElement) {
  // 기본 스타일 설정
  const originalPosition = element.style.position
  const originalOverflow = element.style.overflow
  const originalAnimation = element.style.animation

  element.style.position = 'relative'
  element.style.overflow = 'hidden'
  element.style.animation = 'chzzk-glitch-anim 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) both'

  // TV 노이즈 오버레이 생성
  const overlay = document.createElement('div')
  overlay.className = 'chzzk-static-overlay'
  element.appendChild(overlay)

  // 250ms 후 정리
  setTimeout(() => {
    overlay.remove()
    element.style.position = originalPosition
    element.style.overflow = originalOverflow
    element.style.animation = originalAnimation
  }, 250)
}

/**
 * 글리치 효과 전체 실행: 사운드 + 시각 효과
 */
export function triggerGlitchEffect(element: HTMLElement) {
  playGlitchSound()
  applyGlitchAnimation(element)
}
