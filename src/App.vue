<script setup>
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import { App as AntApp, Button, Input, Space, Switch, Tag, Tour } from 'ant-design-vue'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  AppstoreOutlined,
  StarOutlined,
  LinkOutlined,
  ToolOutlined,
  VideoCameraOutlined,
  ShoppingOutlined,
  BookOutlined,
  CloudOutlined,
  GlobalOutlined,
  CompassOutlined,
  PlayCircleOutlined,
  PictureOutlined,
  MessageOutlined,
  ThunderboltOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue'
import { useTheme } from './composables/useTheme'
import MenuList from './components/MenuList.vue'
import LinkGrid from './components/LinkGrid.vue'
import LinkFormModal from './components/LinkFormModal.vue'
import MenuFormModal from './components/MenuFormModal.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'
import brandLogoLight from './assets/images/altr.svg'
import brandLogoDark from './assets/images/white_altr.svg'

const storageKey = 'aggregation-platform-state'

const seedMenus = [
  { id: 'wk', name: '工作效率', icon: 'ThunderboltOutlined' },
  { id: 'dev', name: '开发工具', icon: 'ToolOutlined' },
  { id: 'ref', name: '学习资料', icon: 'BookOutlined' },
  { id: 'links', name: '友情链接', icon: 'LinkOutlined' },
]

const seedLinks = [
  {
    id: 'notion',
    menuId: 'wk',
    title: 'Notion 团队空间',
    url: 'https://www.notion.so/',
    description: '团队知识库与任务协同的主页。',
    tags: ['工具', '文档', '协作'],
  },
  {
    id: 'linear',
    menuId: 'wk',
    title: 'Linear 项目板',
    url: 'https://linear.app/',
    description: '项目进度、需求与缺陷的统一入口。',
    tags: ['工具', '项目', '协作'],
  },
  {
    id: 'github',
    menuId: 'dev',
    title: 'GitHub',
    url: 'https://github.com/',
    description: '代码仓库与 PR 汇总。',
    tags: ['开发', '代码', '资源'],
  },
  {
    id: 'figma',
    menuId: 'ref',
    title: 'Figma 设计稿',
    url: 'https://www.figma.com/',
    description: '设计规范与最新交互稿集合。',
    tags: ['设计', '工具', '素材'],
  },
  {
    id: 'novel-preview',
    menuId: 'links',
    title: 'Skill 创作小说（预览）',
    url: 'https://novelplatform-one.vercel.app/',
    description: '创作小说平台的预览地址。',
    tags: ['预览', '娱乐', '内容'],
  },
  {
    id: 'novel-github',
    menuId: 'links',
    title: 'Skill 创作小说（GitHub）',
    url: 'https://github.com/GYY-y/novelPlatform',
    description: '创作小说平台的 GitHub 仓库。',
    tags: ['开发', 'GitHub', '资源'],
  },
  {
    id: 'spring-preview',
    menuId: 'links',
    title: '春节小游戏（预览）',
    url: 'https://minigame-delta-inky.vercel.app/',
    description: '春节小游戏预览地址。',
    tags: ['预览', '娱乐', '游戏'],
  },
  {
    id: 'spring-github',
    menuId: 'links',
    title: '春节小游戏（GitHub）',
    url: 'https://github.com/GYY-y/mini-game',
    description: '春节小游戏的 GitHub 仓库。',
    tags: ['开发', 'GitHub', '资源'],
  },
  {
    id: 'agg-preview',
    menuId: 'links',
    title: '聚合工作台（预览）',
    url: 'https://aggregation-platform.vercel.app/',
    description: '当前平台的预览地址。',
    tags: ['预览', '工具', '资源'],
  },
  {
    id: 'agg-github',
    menuId: 'links',
    title: '聚合工作台（GitHub）',
    url: 'https://github.com/GYY-y/AggregationPlatform',
    description: '当前平台的 GitHub 仓库。',
    tags: ['开发', 'GitHub', '资源'],
  },
]

const seedTags = Array.from(new Set(seedLinks.flatMap((link) => link.tags)))

const seedSettings = {
  columns: 4,
  showDescription: true,
  dense: false,
  accent: '#4F7AFA',
  theme: 'system',
  showMenuCount: false,
  enableDrag: false,
}

const baseLight = {
  background: '#f6f8ff',
  surface: '#ffffff',
  surfaceAlt: '#f1f3ff',
  line: 'rgba(0,0,0,0.08)',
  muted: '#5f708f',
  text: '#1f2430',
}
const baseDark = {
  background: '#0b1021',
  surface: '#131b33',
  surfaceAlt: '#0f162d',
  line: 'rgba(255,255,255,0.08)',
  muted: '#9bb2d6',
  text: '#dfe7ff',
}

const themePresets = {
  dark: { accent: '#4F7AFA', ...baseDark },
  light: { accent: '#3056d3', ...baseLight },
}

const state = reactive({
  menus: [],
  links: [],
  settings: { ...seedSettings },
  activeMenuId: '',
  search: '',
})

const linkModalOpen = ref(false)
const menuModalOpen = ref(false)
const editingLinkId = ref(null)
const editingMenuId = ref(null)
const draggingMenuId = ref(null)
const draggingLinkId = ref(null)
const importInput = ref(null)
const settingDrawerOpen = ref(false)
const newMenuBtnRef = ref(null)
const newLinkBtnRef = ref(null)
const settingBtnRef = ref(null)
const dragSwitchRef = ref(null)
const tourOpen = ref(false)
const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
  labelAlign: 'right',
}
const linkRules = {
  title: [{ required: true, message: '请输入标题' }],
  url: [{ required: true, message: '请输入链接' }],
  menuId: [{ required: true, message: '请选择菜单' }],
  description: [{ max: 100, message: '描述最多 100 字' }],
}
const menuIconOptions = [
  { value: 'AppstoreOutlined', label: '应用', icon: AppstoreOutlined },
  { value: 'StarOutlined', label: '收藏', icon: StarOutlined },
  { value: 'LinkOutlined', label: '链接', icon: LinkOutlined },
  { value: 'ToolOutlined', label: '工具', icon: ToolOutlined },
  { value: 'VideoCameraOutlined', label: '视频', icon: VideoCameraOutlined },
  { value: 'ShoppingOutlined', label: '购物', icon: ShoppingOutlined },
  { value: 'BookOutlined', label: '学习', icon: BookOutlined },
  { value: 'CloudOutlined', label: '云盘', icon: CloudOutlined },
  { value: 'GlobalOutlined', label: '资讯', icon: GlobalOutlined },
  { value: 'CompassOutlined', label: '出行', icon: CompassOutlined },
  { value: 'PlayCircleOutlined', label: '娱乐', icon: PlayCircleOutlined },
  { value: 'PictureOutlined', label: '设计', icon: PictureOutlined },
  { value: 'MessageOutlined', label: '社交', icon: MessageOutlined },
  { value: 'ThunderboltOutlined', label: '效率', icon: ThunderboltOutlined },
]

const menuIconMap = {
  AppstoreOutlined,
  StarOutlined,
  LinkOutlined,
  ToolOutlined,
  VideoCameraOutlined,
  ShoppingOutlined,
  BookOutlined,
  CloudOutlined,
  GlobalOutlined,
  CompassOutlined,
  PlayCircleOutlined,
  PictureOutlined,
  MessageOutlined,
  ThunderboltOutlined,
  default: AppstoreOutlined,
}

const menuRules = {
  name: [
    {
      required: true,
      validator: (_, value) => {
        const len = (value || '').trim().length
        if (!len) return Promise.reject(new Error('请输入菜单名称'))
        if (len > 4) return Promise.reject(new Error('名称最多 4 个字'))
        return Promise.resolve()
      },
      message: '请输入菜单名称',
      trigger: ['blur', 'change'],
    },
  ],
  icon: [
    {
      required: true,
      message: '请选择菜单图标',
      trigger: ['blur', 'change'],
    },
  ],
}
const { message: messageApi } = AntApp.useApp()
const { userTheme, effectiveTheme, setTheme } = useTheme()
const themeValue = computed({
  get: () => userTheme.value,
  set: (val) => {
    state.settings.theme = val
    setTheme(val)
  },
})

const linkForm = reactive({
  title: '',
  url: '',
  description: '',
  tags: [],
  menuId: '',
})

const menuForm = reactive({
  name: '',
  icon: '',
})

const activeMenu = computed(() => state.menus.find((m) => m.id === state.activeMenuId))

const filteredLinks = computed(() => {
  const keyword = state.search.trim().toLowerCase()
  return state.links
    .filter((link) => (state.activeMenuId ? link.menuId === state.activeMenuId : true))
    .filter((link) => {
      if (!keyword) return true
      return (
        link.title.toLowerCase().includes(keyword) ||
        link.description.toLowerCase().includes(keyword) ||
        link.tags.some((t) => t.toLowerCase().includes(keyword))
      )
    })
})

const availableTags = computed(() => {
  const tagSet = new Set()
  const scopedLinks = state.activeMenuId
    ? state.links.filter((l) => l.menuId === state.activeMenuId)
    : state.links
  scopedLinks.forEach((l) => l.tags.forEach((t) => tagSet.add(t)))
  return Array.from(tagSet)
})

const activeTag = computed(() => {
  const keyword = state.search.trim()
  if (!keyword) return ''
  return availableTags.value.find((tag) => tag.toLowerCase() === keyword.toLowerCase()) || ''
})

const tagOptions = computed(() => {
  const merged = new Set(seedTags)
  availableTags.value.forEach((tag) => merged.add(tag))
  return Array.from(merged)
})

const menuLinkCount = computed(() => {
  const map = {}
  state.links.forEach((l) => {
    map[l.menuId] = (map[l.menuId] || 0) + 1
  })
  return map
})

const tagPalette = [
  { bg: '#1677ff', text: '#fff' },
  { bg: '#13c2c2', text: '#fff' },
  { bg: '#52c41a', text: '#0b1a0a' },
  { bg: '#fa8c16', text: '#1f0f00' },
  { bg: '#f5222d', text: '#fff' },
  { bg: '#722ed1', text: '#fff' },
  { bg: '#2f54eb', text: '#fff' },
  { bg: '#08979c', text: '#fff' },
  { bg: '#a0d911', text: '#0d1a00' },
  { bg: '#eb2f96', text: '#fff' },
]

const tagStyleMap = computed(() => {
  const map = {}
  availableTags.value.forEach((tag, idx) => {
    const { bg, text } = tagPalette[idx % tagPalette.length]
    map[tag] = { backgroundColor: bg, color: text, borderColor: bg }
  })
  return map
})

function getTagStyle(tag) {
  if (!tag) {
    const { bg, text } = tagPalette[0]
    return { backgroundColor: bg, color: text, borderColor: bg }
  }
  return tagStyleMap.value[tag] || (() => {
    const { bg, text } = tagPalette[0]
    return { backgroundColor: bg, color: text, borderColor: bg }
  })()
}

const denseClass = computed(() => (state.settings.dense ? 'card--dense' : ''))
const canDrag = computed(() => state.settings.enableDrag)

const themeVars = computed(() => {
  const preset = effectiveTheme.value === 'dark' ? themePresets.dark : themePresets.light
  const accent = state.settings.accent || preset.accent || themePresets.light.accent
  const accent2 = lightenColor(accent, effectiveTheme.value === 'light' ? 0.15 : 0.25)
  return {
    '--accent': accent,
    '--accent-2': accent2,
    '--bg': preset.background,
    '--surface': preset.surface,
    '--surface-alt': preset.surfaceAlt,
    '--line': preset.line,
    '--muted': preset.muted,
    '--text': preset.text,
  }
})

const brandLogo = computed(() => (effectiveTheme.value === 'dark' ? brandLogoDark : brandLogoLight))

const tourSteps = computed(() => [
  {
    title: '新增菜单',
    description: '先创建一个菜单，方便归类链接。',
    target: () => newMenuBtnRef.value?.$el || newMenuBtnRef.value,
  },
  {
    title: '开启拖拽',
    description: '打开开关后，可以拖动菜单或卡片调整顺序。',
    target: () => dragSwitchRef.value?.$el || dragSwitchRef.value,
  },
  {
    title: '创建链接',
    description: '点击这里快速新增一个链接卡片。',
    target: () => newLinkBtnRef.value?.$el || newLinkBtnRef.value,
  },
  {
    title: '配置项',
    description: '调整列数、主题、导入导出等配置入口。',
    target: () => settingBtnRef.value?.$el || settingBtnRef.value,
  },
])

watch(
  () => ({ menus: state.menus, links: state.links, settings: state.settings, activeMenuId: state.activeMenuId }),
  (val) => {
    localStorage.setItem(storageKey, JSON.stringify(val))
  },
  { deep: true }
)

watch(
  themeVars,
  (vars) => {
    applyThemeVars(vars)
  },
  { immediate: true }
)

watch(
  userTheme,
  (mode) => {
    state.settings.theme = mode
  },
  { immediate: true }
)

onMounted(() => {
  loadInitialState()
})

function resetLinkForm(menuId = state.activeMenuId) {
  linkForm.title = ''
  linkForm.url = ''
  linkForm.description = ''
  linkForm.tags = []
  linkForm.menuId = menuId || state.menus[0]?.id || ''
}

function resetMenuForm() {
  menuForm.name = ''
  menuForm.icon = ''
}

function openNewLink() {
  editingLinkId.value = null
  resetLinkForm()
  linkModalOpen.value = true
}

function openEditLink(link) {
  editingLinkId.value = link.id
  linkForm.title = link.title
  linkForm.url = link.url
  linkForm.description = link.description
  linkForm.tags = [...link.tags]
  linkForm.menuId = link.menuId
  linkModalOpen.value = true
}

function submitLink() {
  const tags = Array.isArray(linkForm.tags) ? linkForm.tags.filter(Boolean) : []

  if (editingLinkId.value) {
    const target = state.links.find((l) => l.id === editingLinkId.value)
    if (target) {
      Object.assign(target, {
        title: linkForm.title.trim(),
        url: linkForm.url.trim(),
        description: linkForm.description.trim(),
        tags,
        menuId: linkForm.menuId,
      })
    }
  } else {
    state.links.unshift({
      id: createId(),
      title: linkForm.title.trim(),
      url: linkForm.url.trim(),
      description: linkForm.description.trim(),
      tags,
      menuId: linkForm.menuId,
    })
  }
  linkModalOpen.value = false
  editingLinkId.value = null
  resetLinkForm()
  setToast('已保存链接')
}

function deleteLink(id) {
  state.links = state.links.filter((l) => l.id !== id)
}

function openNewMenu() {
  editingMenuId.value = null
  resetMenuForm()
  menuModalOpen.value = true
}

function openEditMenu(menu) {
  editingMenuId.value = menu.id
  menuForm.name = menu.name
  menuForm.icon = menu.icon || ''
  menuModalOpen.value = true
}

function submitMenu() {
  const name = menuForm.name.trim()
  if (!name) return setToast('请输入菜单名称', 'error')
  if (name.length > 4) return setToast('名称最多 4 个字', 'error')
  if (!menuForm.icon) return setToast('请选择菜单图标', 'error')
  const duplicate = state.menus.some(
    (menu) => menu.name === name && menu.id !== editingMenuId.value
  )
  if (duplicate) return setToast('菜单名称已存在', 'error')

  if (editingMenuId.value) {
    const target = state.menus.find((m) => m.id === editingMenuId.value)
    if (target) {
      target.name = name
      target.icon = menuForm.icon
    }
  } else {
    const id = createId()
    state.menus.push({ id, name, icon: menuForm.icon })
    state.menus = normalizeMenus(state.menus)
    state.activeMenuId = id
  }
  menuModalOpen.value = false
  editingMenuId.value = null
  resetMenuForm()
}

function deleteMenu(id) {
  state.menus = state.menus.filter((m) => m.id !== id)
  state.links = state.links.filter((l) => l.menuId !== id)
  if (state.activeMenuId === id) {
    state.activeMenuId = state.menus[0]?.id || ''
  }
}

function startMenuDrag(id) {
  if (!canDrag.value) return
  draggingMenuId.value = id
}

function dropMenu(targetId) {
  if (!canDrag.value) return
  if (!draggingMenuId.value || draggingMenuId.value === targetId) return
  state.menus = normalizeMenus(moveItem(state.menus, draggingMenuId.value, targetId))
  draggingMenuId.value = null
}

function startLinkDrag(id) {
  if (!canDrag.value) return
  draggingLinkId.value = id
}

function dropLink(targetId) {
  if (!canDrag.value) return
  if (!draggingLinkId.value || draggingLinkId.value === targetId) return
  const from = state.links.find((l) => l.id === draggingLinkId.value)
  const to = state.links.find((l) => l.id === targetId)
  if (!from || !to || from.menuId !== to.menuId) return
  const menuId = from.menuId
  const sameMenuLinks = state.links.filter((l) => l.menuId === menuId)
  const reordered = moveItem(sameMenuLinks, draggingLinkId.value, targetId)
  const others = state.links.filter((l) => l.menuId !== menuId)
  state.links = [...others, ...reordered]
  draggingLinkId.value = null
}

function openLink(url) {
  window.open(url, '_blank', 'noopener')
}

function toggleTagFilter(tag) {
  const current = state.search.trim()
  if (current === tag) {
    state.search = ''
    return
  }
  state.search = tag
}

async function copyTitle(title) {
  if (!title) return
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(title)
    } else {
      const input = document.createElement('textarea')
      input.value = title
      input.setAttribute('readonly', '')
      input.style.position = 'absolute'
      input.style.left = '-9999px'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setToast('标题已复制')
  } catch (err) {
    console.error(err)
    messageApi?.error?.('复制失败，请手动复制')
  }
}

function exportConfig() {
  const payload = {
    menus: state.menus,
    links: state.links,
    settings: state.settings,
    activeMenuId: state.activeMenuId,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'aggregation-config.json'
  a.click()
  URL.revokeObjectURL(url)
  setToast('已导出配置')
}

function triggerImport() {
  importInput.value?.click()
}

function handleImport(event) {
  const [file] = event.target.files || []
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result)
      if (!Array.isArray(parsed.menus) || !Array.isArray(parsed.links)) throw new Error('格式不正确')
      state.menus = normalizeMenus(parsed.menus)
      state.links = parsed.links
      state.settings = { ...seedSettings, ...(parsed.settings || {}) }
      if (state.settings.theme) {
        setTheme(['light', 'dark', 'system'].includes(state.settings.theme) ? state.settings.theme : 'system')
      }
      state.activeMenuId = parsed.activeMenuId || parsed.menus?.[0]?.id || ''
      setToast('已导入配置')
    } catch (err) {
      console.error(err)
      setToast('导入失败：请检查 JSON', 'error')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

function clearCache() {
  localStorage.removeItem(storageKey)
  applySeedData()
  setToast('已清除缓存并恢复默认')
}

function setToast(message, type = 'success') {
  const handler = messageApi?.[type] || messageApi?.success
  handler?.(message)
}

function createId() {
  return Math.random().toString(36).slice(2, 8)
}

function normalizeMenus(list) {
  if (!Array.isArray(list)) return []
  const next = list.map((item) => ({
    ...item,
    icon: item.icon || 'AppstoreOutlined',
  }))
  const index = next.findIndex((item) => item.id === 'links')
  if (index === -1) return next
  const [linksMenu] = next.splice(index, 1)
  next.push(linksMenu)
  return next
}

function moveItem(list, fromId, toId) {
  const fromIndex = list.findIndex((item) => item.id === fromId)
  const toIndex = list.findIndex((item) => item.id === toId)
  if (fromIndex === -1 || toIndex === -1) return list
  const next = [...list]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

function lightenColor(hex, ratio = 0.2) {
  if (typeof hex !== 'string') return hex
  const cleaned = hex.replace('#', '')
  const normalized = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned
  if (normalized.length !== 6) return hex
  const num = parseInt(normalized, 16)
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  const mix = (channel) => Math.round(channel + (255 - channel) * ratio)
  const toHex = (v) => v.toString(16).padStart(2, '0')
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`
}

function darkenColor(hex, ratio = 0.2) {
  if (typeof hex !== 'string') return hex
  const cleaned = hex.replace('#', '')
  const normalized = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned
  if (normalized.length !== 6) return hex
  const num = parseInt(normalized, 16)
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  const mix = (channel) => Math.round(channel * (1 - ratio))
  const toHex = (v) => v.toString(16).padStart(2, '0')
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`
}

function applyThemeVars(vars = {}) {
  const root = document.documentElement
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

function applySeedData() {
  state.menus = normalizeMenus([...seedMenus])
  state.links = [...seedLinks]
  state.settings = { ...seedSettings }
  state.activeMenuId = seedMenus[0].id
  state.search = ''
  setTheme(seedSettings.theme)
  state.settings.accent = seedSettings.accent
}

function loadInitialState() {
  try {
    const cache = localStorage.getItem(storageKey)
    if (cache) {
      const parsed = JSON.parse(cache)
      const resolvedMenus = normalizeMenus(parsed.menus?.length ? parsed.menus : [...seedMenus])
      const resolvedLinks = parsed.links?.length ? parsed.links : [...seedLinks]
      const resolvedSettings = { ...seedSettings, ...(parsed.settings || {}) }
      const validTheme = ['light', 'dark', 'system'].includes(resolvedSettings.theme)
        ? resolvedSettings.theme
        : 'system'
      setTheme(validTheme)
      const resolvedActiveMenuId =
        parsed.activeMenuId ||
        parsed.menus?.[0]?.id ||
        (resolvedMenus.length ? resolvedMenus[0].id : seedMenus[0].id)
      state.menus = resolvedMenus
      state.links = resolvedLinks
      state.settings = resolvedSettings
      state.activeMenuId = resolvedActiveMenuId
      const defaultCache = {
        menus: seedMenus,
        links: seedLinks,
        settings: seedSettings,
        activeMenuId: seedMenus[0].id,
      }
      const resolvedCache = {
        menus: resolvedMenus,
        links: resolvedLinks,
        settings: resolvedSettings,
        activeMenuId: resolvedActiveMenuId,
      }
      if (JSON.stringify(defaultCache) === JSON.stringify(resolvedCache)) {
        tourOpen.value = true
      }
    } else {
      applySeedData()
      tourOpen.value = true
    }
  } catch (err) {
    console.warn('读取缓存失败', err)
    applySeedData()
  }
}
</script>

<template>
  <div class="app-shell" :style="themeVars">
      <aside class="sidebar sidebar--compact">
        <div class="brand">
          <img class="brand__logo" :src="brandLogo" alt="Altr Logo" />
        </div>
        <input ref="importInput" type="file" accept="application/json" class="hidden" @change="handleImport" />
        <MenuList
          :menus="state.menus"
          :active-menu-id="state.activeMenuId"
          :show-menu-count="state.settings.showMenuCount"
          :menu-link-count="menuLinkCount"
          :can-drag="canDrag"
          :accent="state.settings.accent"
          :icon-map="menuIconMap"
          :edit-icon="h(EditOutlined)"
          :delete-icon="h(DeleteOutlined)"
          :disable-edit-ids="['links']"
          @select="state.activeMenuId = $event"
          @edit="openEditMenu"
          @delete="deleteMenu"
          @drag-start="startMenuDrag"
          @drag-end="draggingMenuId = null"
          @drop="dropMenu"
        />
        <div class="sidebar__actions">
          <Button
            ref="newMenuBtnRef"
            shape="circle"
            class="menu-add-btn"
            type="text"
            size="large"
            :icon="h(PlusOutlined)"
            @click="openNewMenu"
          />
        </div>
      </aside>

      <main class="content">
        <header class="header">
          <div>
            <h1>链接聚合</h1>
            <p class="muted">固定常用、分组管理、随时导入导出配置。</p>
          </div>
      <Space class="header__actions" wrap>
        <Space size="middle">
          <span class="muted">允许拖拽</span>
          <Switch ref="dragSwitchRef" v-model:checked="state.settings.enableDrag" />
        </Space>
        <Button ref="newLinkBtnRef" type="primary" size="large" @click="openNewLink" :icon="h(PlusOutlined)">新增链接</Button>
        <Button ref="settingBtnRef" size="large" @click="settingDrawerOpen = true" :icon="h(SettingOutlined)">配置项</Button>
      </Space>
        </header>

        <div class="toolbar">
          <Input
            v-model:value="state.search"
            allow-clear
            size="large"
            class="search-input"
            style="width: 280px"
            placeholder="搜索标题、标签"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </Input>
        <div class="tag-row">
          <span class="muted">标签:</span>
          <span v-if="!availableTags.length" class="muted">暂无</span>
          <Tag
            v-for="tag in availableTags"
            :key="tag"
            :style="getTagStyle(tag)"
            :class="{ 'tag--active': state.search.trim() === tag }"
            @click="toggleTagFilter(tag)"
          >
            {{ tag }}
          </Tag>
        </div>
        </div>

        <LinkGrid
          :links="filteredLinks"
          :can-drag="canDrag"
          :dense="state.settings.dense"
          :show-description="state.settings.showDescription"
          :style="{ gridTemplateColumns: `repeat(${state.settings.columns}, minmax(0, 1fr))` }"
          :get-tag-style="getTagStyle"
          :active-tag="activeTag"
          @open="openLink"
          @edit="openEditLink"
          @delete="deleteLink"
          @drag-start="startLinkDrag"
          @drag-end="draggingLinkId = null"
          @drop="dropLink"
          @copy-title="copyTitle"
        />
      </main>

      <LinkFormModal
        v-model:open="linkModalOpen"
        :title="editingLinkId ? '编辑链接' : '新增链接'"
        :link-form="linkForm"
        :link-rules="linkRules"
        :form-layout="formLayout"
        :menus="state.menus"
        :tag-options="tagOptions"
        @submit="submitLink"
      />

      <MenuFormModal
        v-model:open="menuModalOpen"
        :title="editingMenuId ? '编辑菜单' : '新增菜单'"
        :menu-form="menuForm"
        :menu-rules="menuRules"
        :form-layout="formLayout"
        :icon-options="menuIconOptions"
        @submit="submitMenu"
      />

      <SettingsDrawer
        v-model:open="settingDrawerOpen"
        :form-layout="formLayout"
        :settings="state.settings"
        :theme-value="themeValue"
        @update:themeValue="themeValue = $event"
        @export="exportConfig"
        @import="triggerImport"
        @clear="clearCache"
      />

      <a-tour
        :open="tourOpen"
        :steps="tourSteps"
        :locale="{ Next: '下一步', Previous: '上一步', Finish: '结束' }"
        @close="tourOpen = false"
      />
    </div>
</template>
<!-- <style scoped lang="scss">
:deep(.ant-card-body){
  padding: 0 24px;
}
</style> -->
