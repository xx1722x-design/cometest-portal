import { useSyncExternalStore } from 'react'

// 다크/라이트 테마의 단일 출처.
// <html> 에 theme-dark / theme-light 클래스를 붙이고, 모든 색은 CSS 변수
// (src/styles/portal.css 의 :root / .theme-light)로 파생한다. 컴포넌트마다
// localStorage 를 따로 읽던 방식은 페이지별로 테마가 어긋나고(카테고리 페이지는
// 항상 라이트 배경 + 다크 헤더), 첫 렌더에 다크가 번쩍이는 문제가 있었다.

const STORAGE_KEY = 'darkMode' // 기존 저장 키 유지 (true = 다크)

function readStored(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === null ? true : JSON.parse(saved) === true
  } catch {
    return true
  }
}

let isDark = readStored()
const listeners = new Set<() => void>()

function applyToDOM(dark: boolean) {
  const root = document.documentElement
  root.classList.toggle('theme-dark', dark)
  root.classList.toggle('theme-light', !dark)
  root.style.colorScheme = dark ? 'dark' : 'light'
}

// 모듈 로드 시(첫 렌더 전) 즉시 적용 — 라이트 모드 사용자에게 다크가 번쩍이지 않도록
applyToDOM(isDark)

export function setDarkMode(dark: boolean) {
  isDark = dark
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dark))
  } catch {
    // 저장 불가 — 이번 세션 동안만 유지
  }
  applyToDOM(dark)
  listeners.forEach((fn) => fn())
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useDarkMode(): [boolean, () => void] {
  const dark = useSyncExternalStore(subscribe, () => isDark)
  return [dark, () => setDarkMode(!dark)]
}
