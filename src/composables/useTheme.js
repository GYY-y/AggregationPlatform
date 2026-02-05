import { computed, ref } from 'vue'
import { theme as antdTheme } from 'ant-design-vue'

const STORAGE_KEY = 'app-theme-mode' // 'light' | 'dark' | 'system'
const FALLBACK = 'system'

const media = window.matchMedia?.('(prefers-color-scheme: dark)')
const systemTheme = ref(media?.matches ? 'dark' : 'light')
const saved = localStorage.getItem(STORAGE_KEY)
const userTheme = ref(saved || FALLBACK)

const effectiveTheme = computed(() => (userTheme.value === 'system' ? systemTheme.value : userTheme.value))
const isDark = computed(() => effectiveTheme.value === 'dark')
const algorithm = computed(() => (isDark.value ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm))

function setTheme(mode) {
  userTheme.value = mode
  localStorage.setItem(STORAGE_KEY, mode)
  syncDom(effectiveTheme.value)
}

function syncDom(mode) {
  const value = mode || effectiveTheme.value
  document.documentElement.setAttribute('data-theme', value)
  document.documentElement.style.colorScheme = value === 'dark' ? 'dark' : 'light'
}

if (media?.addEventListener) {
  media.addEventListener('change', (e) => {
    systemTheme.value = e.matches ? 'dark' : 'light'
    if (userTheme.value === 'system') syncDom(e.matches ? 'dark' : 'light')
  })
} else if (media?.addListener) {
  // 兼容老浏览器
  media.addListener((e) => {
    systemTheme.value = e.matches ? 'dark' : 'light'
    if (userTheme.value === 'system') syncDom(e.matches ? 'dark' : 'light')
  })
}

// 首次同步，避免 FOUC
syncDom(effectiveTheme.value)

export function useTheme() {
  return {
    userTheme,
    effectiveTheme,
    isDark,
    algorithm,
    setTheme,
  }
}
