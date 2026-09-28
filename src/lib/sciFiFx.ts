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

// 미래지향적 버튼 소리: 상승하는 톤 + 명확한 확인음
export function playPanelBeep() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime

  const master = ctx.createGain()
  master.gain.value = 0.18
  master.connect(ctx.destination)

  // 1) 상승음: sine 600Hz → 1200Hz, 밝고 미래지향적 (140ms)
  const rise = ctx.createOscillator()
  const riseGain = ctx.createGain()
  rise.type = 'sine'
  rise.frequency.setValueAtTime(600, now)
  rise.frequency.exponentialRampToValueAtTime(1200, now + 0.14)
  riseGain.gain.setValueAtTime(0.0001, now)
  riseGain.gain.exponentialRampToValueAtTime(0.6, now + 0.01)
  riseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15)
  rise.connect(riseGain).connect(master)
  rise.start(now)
  rise.stop(now + 0.16)

  // 2) 확인 하강음: sine 1200Hz → 800Hz, 더 깊은 톤으로 안정감
  const confirm = ctx.createOscillator()
  const confirmGain = ctx.createGain()
  const t2 = now + 0.08
  confirm.type = 'sine'
  confirm.frequency.setValueAtTime(1200, t2)
  confirm.frequency.exponentialRampToValueAtTime(800, t2 + 0.12)
  confirmGain.gain.setValueAtTime(0.0001, t2)
  confirmGain.gain.exponentialRampToValueAtTime(0.5, t2 + 0.01)
  confirmGain.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.13)
  confirm.connect(confirmGain).connect(master)
  confirm.start(t2)
  confirm.stop(t2 + 0.14)

  // 노드 정리
  confirm.onended = () => master.disconnect()
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
