/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * DO NOT MODIFY: cometest.com 10-Year Signature Effect (Approved by CEO)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 청량하고 부드러운 디지털 글리치 이펙트
 * - 시각: Chromatic Aberration (청록/자홍) + SVG TV 노이즈 + 스캔라인
 * - 청각: Sine 1500Hz 맑은 팝 + Bandpass 2500Hz 부드러운 치지직 스터터
 *
 * 이 이펙트는 cometest.com의 브랜드 아이덴티티입니다.
 * 절대 삭제하거나 임의로 수정하지 마세요.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * cometest.com 시그니처 글리치 효과 완전 통합 실행
 * @param element - 글리치 효과를 적용할 HTML 요소
 */
export function playSignatureGlitch(element: HTMLElement) {
  // 청음 + 시각 효과 동시 실행
  playSignatureSound()
  applySignatureAnimation(element)
}

/**
 * 시그니처 사운드: 청량하고 부드러운 2레이어 오디오
 * - 레이어 1: 맑은 Sine 1500Hz → 300Hz 팝
 * - 레이어 2: 부드러운 Bandpass 2500Hz 화이트 노이즈 스터터
 */
function playSignatureSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const t = audioCtx.currentTime

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 레이어 1: 맑고 청량한 디지털 팝 (Refreshing Digital Zap)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const zapOsc = audioCtx.createOscillator()
    const zapGain = audioCtx.createGain()
    zapOsc.type = 'sine' // 가장 맑고 부드러운 파형
    zapOsc.frequency.setValueAtTime(1500, t) // 기분 좋은 하이톤
    zapOsc.frequency.exponentialRampToValueAtTime(300, t + 0.15)
    zapGain.gain.setValueAtTime(0.2, t)
    zapGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15)
    zapOsc.connect(zapGain).connect(audioCtx.destination)
    zapOsc.start(t)
    zapOsc.stop(t + 0.15)

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 레이어 2: 귀가 편안한 모래알 치지직 (Soft & Crispy Static)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const bufferSize = audioCtx.sampleRate * 0.25
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    // 화이트 노이즈 강도 50% 낮춤 (0.5 곱하기)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5
    }
    const noiseSource = audioCtx.createBufferSource()
    noiseSource.buffer = buffer
    const noiseFilter = audioCtx.createBiquadFilter()
    // Bandpass: 청량한 소리만 남김
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.value = 2500
    const noiseGain = audioCtx.createGain()

    // 치지직 스터터링: 0.03초, 0.05초, 0.1초, 0.12초에서 on/off
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
 * 시그니처 애니메이션: Chromatic Aberration + TV 노이즈
 * @param element - 애니메이션을 적용할 요소
 */
function applySignatureAnimation(element: HTMLElement) {
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
