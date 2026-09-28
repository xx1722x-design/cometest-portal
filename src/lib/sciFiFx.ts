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

// 철컹 기계음: 메탈릭하고 기계적인 느낌
export function playPanelBeep() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime

  const master = ctx.createGain()
  master.gain.value = 0.2
  master.connect(ctx.destination)

  // 1) 철컹: square wave 2200Hz → 800Hz, 급격한 하강 (50ms) - 하이톤
  const clang = ctx.createOscillator()
  const clangGain = ctx.createGain()
  const clangFilter = ctx.createBiquadFilter()
  clang.type = 'square'
  clang.frequency.setValueAtTime(2200, now)
  clang.frequency.exponentialRampToValueAtTime(800, now + 0.05)
  clangFilter.type = 'highpass'
  clangFilter.frequency.value = 1200
  clangGain.gain.setValueAtTime(0.0001, now)
  clangGain.gain.exponentialRampToValueAtTime(0.7, now + 0.002)
  clangGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)
  clang.connect(clangFilter).connect(clangGain).connect(master)
  clang.start(now)
  clang.stop(now + 0.07)

  // 2) 공명음: sine 700Hz → 350Hz, 하이톤 울림 (180ms)
  const resonance = ctx.createOscillator()
  const resonanceGain = ctx.createGain()
  const t1 = now + 0.01
  resonance.type = 'sine'
  resonance.frequency.setValueAtTime(700, t1)
  resonance.frequency.exponentialRampToValueAtTime(350, t1 + 0.18)
  resonanceGain.gain.setValueAtTime(0.0001, t1)
  resonanceGain.gain.exponentialRampToValueAtTime(0.5, t1 + 0.01)
  resonanceGain.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.19)
  resonance.connect(resonanceGain).connect(master)
  resonance.start(t1)
  resonance.stop(t1 + 0.2)

  // 3) 기계음 펄스: 하이톤 클릭감 360Hz
  const pulse = ctx.createOscillator()
  const pulseGain = ctx.createGain()
  const t2 = now + 0.04
  pulse.type = 'square'
  pulse.frequency.setValueAtTime(360, t2)
  pulseGain.gain.setValueAtTime(0.0001, t2)
  pulseGain.gain.exponentialRampToValueAtTime(0.3, t2 + 0.01)
  pulseGain.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.12)
  pulse.connect(pulseGain).connect(master)
  pulse.start(t2)
  pulse.stop(t2 + 0.13)

  // 노드 정리
  pulse.onended = () => master.disconnect()
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
