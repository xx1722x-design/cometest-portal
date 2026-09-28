// 카드 클릭용 Sci-Fi 이펙트: Web Audio 조작음 + 글리치 애니메이션.
// 외부 오디오 파일 없이 Oscillator 로 직접 합성한다.

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  // 브라우저 자동재생 정책상 사용자 제스처(클릭) 안에서 처음 생성/재개해야 한다
  if (!audioCtx) audioCtx = new Ctor()
  if (audioCtx.state === 'suspended') void audioCtx.resume()
  return audioCtx
}

// 스타크래프트 스타일 신비로운 사운드:
// 다중 고음역대 톤 + 신비로운 청소음 효과
export function playPanelBeep() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime

  const master = ctx.createGain()
  master.gain.value = 0.15
  master.connect(ctx.destination)

  // 1) 신비로운 고음 톤 1: 2800Hz → 1400Hz, 느린 하강
  const tone1 = ctx.createOscillator()
  const tone1Gain = ctx.createGain()
  tone1.type = 'sine'
  tone1.frequency.setValueAtTime(2800, now)
  tone1.frequency.exponentialRampToValueAtTime(1400, now + 0.25)
  tone1Gain.gain.setValueAtTime(0.0001, now)
  tone1Gain.gain.exponentialRampToValueAtTime(0.7, now + 0.01)
  tone1Gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
  tone1.connect(tone1Gain).connect(master)
  tone1.start(now)
  tone1.stop(now + 0.31)

  // 2) 신비로운 고음 톤 2: 4200Hz → 2100Hz, 약간 지연 후 시작
  const tone2 = ctx.createOscillator()
  const tone2Gain = ctx.createGain()
  const t2 = now + 0.05
  tone2.type = 'sine'
  tone2.frequency.setValueAtTime(4200, t2)
  tone2.frequency.exponentialRampToValueAtTime(2100, t2 + 0.2)
  tone2Gain.gain.setValueAtTime(0.0001, t2)
  tone2Gain.gain.exponentialRampToValueAtTime(0.5, t2 + 0.01)
  tone2Gain.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.22)
  tone2.connect(tone2Gain).connect(master)
  tone2.start(t2)
  tone2.stop(t2 + 0.23)

  // 3) 침침한 저음 배경: 440Hz, 길고 부드럽게
  const bassTone = ctx.createOscillator()
  const bassToneGain = ctx.createGain()
  const bassFilter = ctx.createBiquadFilter()
  bassTone.type = 'sine'
  bassTone.frequency.setValueAtTime(440, now)
  bassFilter.type = 'lowpass'
  bassFilter.frequency.value = 800
  bassToneGain.gain.setValueAtTime(0.0001, now)
  bassToneGain.gain.exponentialRampToValueAtTime(0.3, now + 0.05)
  bassToneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
  bassTone.connect(bassFilter).connect(bassToneGain).connect(master)
  bassTone.start(now)
  bassTone.stop(now + 0.36)

  // 노드 정리
  bassTone.onended = () => master.disconnect()
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

let overlay: HTMLDivElement | null = null

// 카드에 글리치 클래스를 잠깐 붙이고, 화면 전체에 짧은 스캔라인 노이즈를 띄운다.
// (스타일: src/styles/portal.css 의 .is-glitching / .glitch-overlay)
export function triggerGlitch(el: HTMLElement | null) {
  if (prefersReducedMotion()) return

  if (el) {
    el.classList.remove('is-glitching')
    void el.offsetWidth // 애니메이션 재시작을 위한 reflow
    el.classList.add('is-glitching')
    window.setTimeout(() => el.classList.remove('is-glitching'), 320)
  }

  if (!overlay) {
    overlay = document.createElement('div')
    overlay.className = 'glitch-overlay'
    overlay.setAttribute('aria-hidden', 'true')
    document.body.appendChild(overlay)
  }
  overlay.classList.remove('is-active')
  void overlay.offsetWidth
  overlay.classList.add('is-active')
}

// 글리치 애니메이션이 보이도록 내부 라우팅을 살짝 늦출 때 쓰는 시간(ms)
export const GLITCH_NAV_DELAY = 180
