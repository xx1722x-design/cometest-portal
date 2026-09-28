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

// 우주선 조작 패널 느낌의 짧은 전자음:
// square 파 '틱'(피치 급하강) + sine 파 '삐'(짧은 잔향) 두 겹.
export function playPanelBeep() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime

  const master = ctx.createGain()
  master.gain.value = 0.18
  master.connect(ctx.destination)

  // 1) 클릭 트랜지언트: square 1400Hz → 220Hz, 70ms
  const click = ctx.createOscillator()
  const clickGain = ctx.createGain()
  const lowpass = ctx.createBiquadFilter()
  click.type = 'square'
  click.frequency.setValueAtTime(1400, now)
  click.frequency.exponentialRampToValueAtTime(220, now + 0.07)
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 3200
  clickGain.gain.setValueAtTime(0.0001, now)
  clickGain.gain.exponentialRampToValueAtTime(0.5, now + 0.004)
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)
  click.connect(lowpass).connect(clickGain).connect(master)
  click.start(now)
  click.stop(now + 0.09)

  // 2) 확인음: sine 1046Hz(C6) → 523Hz, 약간 늦게 시작해 180ms decay
  const tone = ctx.createOscillator()
  const toneGain = ctx.createGain()
  const t0 = now + 0.025
  tone.type = 'sine'
  tone.frequency.setValueAtTime(1046, t0)
  tone.frequency.exponentialRampToValueAtTime(523, t0 + 0.16)
  toneGain.gain.setValueAtTime(0.0001, t0)
  toneGain.gain.exponentialRampToValueAtTime(0.6, t0 + 0.01)
  toneGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18)
  tone.connect(toneGain).connect(master)
  tone.start(t0)
  tone.stop(t0 + 0.2)

  // 노드 정리
  tone.onended = () => master.disconnect()
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
