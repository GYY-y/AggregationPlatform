<script setup>
import { computed, h, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { App as AntApp, Button, Input, Space, Switch, Tag, Tooltip, Tour } from 'ant-design-vue'
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
  HomeOutlined,
  InfoCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
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
  contentBackground: '#fcfcfc',
  backgroundImage: '',
  backgroundBlur: 0,
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
const sidebarCollapsed = ref(false)
const sidebarLogoHovered = ref(false)
const sidebarStorageKey = 'aggregation-platform-sidebar-collapsed'
const aboutMenuId = '__about__'
const motivationalQuotes = [
  '醉后不知天在水，满船清梦压星河',
  '晚来天欲雪，能饮一杯无',
  '山中何事，松花酿酒，春水煎茶',
  '既见君子，云胡不喜',
  '你来时冬至，但眉上风止，开口是所谓来日方长',
  '祝你今天愉快，明天的愉快留给我明天再祝',
  '万物皆有裂痕，那是光照进来的地方',
  '我想和你一起生活，在某个小镇，共享无尽的黄昏，和绵绵不绝的钟声',
  '愿有一盏灯，照见晚归的人',
  '春风有信，花开有期',
  '把日子过成一首缓慢的诗',
  '山高水长，来日方长',
  '愿你心之所向，都有回响',
  '云在青天水在瓶，自在便是好时光',
  '清风明月本无价，近水远山皆有情',
  '愿岁月静好，也愿你眼里有光',
  '把烦恼交给晚风，把答案留给时间',
  '星河滚烫，你是人间理想',
  '愿你所遇皆温柔，所行皆坦途',
  '一程山水一程歌，慢慢走，慢慢看',
  '日子清简，心自安然',
  '愿你有茶有书，也有值得等的人',
  '风来疏竹，风过而竹不留声',
  '月色入窗来，今夜宜好梦',
  '所有美好，都会在恰好的时候抵达',
  '不惊不扰，静候花开',
  '愿你三冬暖，愿你春不寒',
  '远方很远，但脚下每一步都算数',
  '把平凡的日子，过得热气腾腾',
  '一半烟火谋生活，一半诗意寻自由',
  '愿你看遍山河，归来仍是少年',
  '有风有雨是常态，风雨兼程是状态',
  '愿每个清晨，都有新的欢喜',
  '日落尤其温柔，人间皆是浪漫',
  '借一缕清风，安放今日心事',
  '愿你眉间无忧，心上有秋',
  '生活不必太满，留一点空白给欢喜',
  '愿你走过长夜，仍相信天明',
  '花会沿路盛开，你以后的路也是',
  '凡是过往，皆为序章',
  '向内生长，向外奔跑',
  '愿你心有微光，缓缓成炬',
  '一念清欢，处处花开',
  '山止川行，风禾尽起',
  '愿你在自己的时区里，按时盛开',
  '不负春光，不负自己',
  '慢一点，才听得见花开的声音',
  '有些路，走下去自会有答案',
  '愿你被世界温柔以待，也温柔地对待自己',
  '把热爱藏在日常，把远方放在心上',
  '一窗暖阳，三两清欢',
  '愿你所得皆所愿，所失亦无憾',
  '心若向阳，何惧路长',
  '今夜月明，适合把思念写成一封信',
  '愿你历尽千帆，归来仍有清风相伴',
  '人间忽晚，山河已秋',
  '愿你眼里有星辰，手中有清风',
  '愿你在每一个普通日子里，都遇见一点不普通的欢喜',
]
const currentQuoteIndex = ref(0)
let quoteTimer
const homeMenuId = '__home__'
const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
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
  home: HomeOutlined,
  about: InfoCircleOutlined,
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
const { message: messageApi, modal: modalApi } = AntApp.useApp()
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
    .filter((link) => (state.activeMenuId && state.activeMenuId !== homeMenuId ? link.menuId === state.activeMenuId : true))
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
  const scopedLinks = state.activeMenuId && state.activeMenuId !== homeMenuId
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
  '#1677ff', '#13c2c2', '#52c41a', '#fa8c16', '#f5222d',
  '#722ed1', '#2f54eb', '#08979c', '#a0d911', '#eb2f96',
]

function getTagTextColor(background) {
  const hex = background.replace('#', '')
  const normalized = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex
  const channels = [0, 2, 4].map((offset) => parseInt(normalized.slice(offset, offset + 2), 16) / 255)
  const luminance = channels.map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
  const contrast = 0.2126 * luminance[0] + 0.7152 * luminance[1] + 0.0722 * luminance[2]
  return contrast > 0.42 ? '#182230' : '#fff'
}

const tagStyleMap = computed(() => {
  const map = {}
  availableTags.value.forEach((tag, idx) => {
    const bg = tagPalette[idx % tagPalette.length]
    map[tag] = { backgroundColor: bg, color: getTagTextColor(bg), borderColor: bg }
  })
  return map
})

function getTagStyle(tag) {
  if (!tag) {
    const bg = tagPalette[0]
    return { backgroundColor: bg, color: getTagTextColor(bg), borderColor: bg }
  }
  return tagStyleMap.value[tag] || (() => {
    const bg = tagPalette[0]
    return { backgroundColor: bg, color: getTagTextColor(bg), borderColor: bg }
  })()
}

const denseClass = computed(() => (state.settings.dense ? 'card--dense' : ''))
const canDrag = computed(() => state.settings.enableDrag)
const isAboutPage = computed(() => state.activeMenuId === aboutMenuId)
const contentBackground = computed(() => {
  const configured = state.settings.contentBackground || '#fcfcfc'
  const isDefault = configured.toLowerCase() === '#fcfcfc'
  return effectiveTheme.value === 'dark' && isDefault ? themePresets.dark.background : configured
})

const themeVars = computed(() => {
  const preset = effectiveTheme.value === 'dark' ? themePresets.dark : themePresets.light
  const accent = state.settings.accent || preset.accent || themePresets.light.accent
  const accent2 = lightenColor(accent, effectiveTheme.value === 'light' ? 0.15 : 0.25)
  return {
    '--accent': accent,
    '--accent-2': accent2,
    '--bg': preset.background,
    '--content-bg': contentBackground.value,
    '--content-bg-layer': state.settings.backgroundImage ? 'transparent' : contentBackground.value,
    '--surface': preset.surface,
    '--surface-alt': preset.surfaceAlt,
    '--line': preset.line,
    '--muted': preset.muted,
    '--text': preset.text,
    '--sidebar-bg': contentBackground.value,
    '--sidebar-bg-layer': state.settings.backgroundImage ? 'transparent' : contentBackground.value,
    '--sidebar-hover': effectiveTheme.value === 'dark' ? '#212121' : '#ececec',
    '--sidebar-active': effectiveTheme.value === 'dark' ? '#2f2f2f' : '#e5e5e5',
    '--sidebar-text': effectiveTheme.value === 'dark' ? '#ececec' : '#2f2f2f',
    '--sidebar-muted': effectiveTheme.value === 'dark' ? '#a1a1a1' : '#6b6b6b',
    '--page-bg-image': state.settings.backgroundImage ? `url("${state.settings.backgroundImage}")` : 'none',
    '--page-bg-blur': `${state.settings.backgroundBlur || 0}px`,
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
    try {
      localStorage.setItem(storageKey, JSON.stringify(val))
    } catch (error) {
      if (error?.name !== 'QuotaExceededError') throw error
      const { backgroundImage, ...settingsWithoutBackground } = val.settings || {}
      try {
        localStorage.setItem(storageKey, JSON.stringify({ ...val, settings: settingsWithoutBackground }))
      } catch (fallbackError) {
        console.warn('配置空间不足，已跳过本次本地保存', fallbackError)
      }
    }
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
  sidebarCollapsed.value = localStorage.getItem(sidebarStorageKey) === 'true'
  window.addEventListener('beforeunload', warnBeforeBrowserDataClear)
  quoteTimer = window.setInterval(() => {
    currentQuoteIndex.value = (currentQuoteIndex.value + 1) % motivationalQuotes.length
  }, 8000)
})

onUnmounted(() => {
  window.clearInterval(quoteTimer)
  window.removeEventListener('beforeunload', warnBeforeBrowserDataClear)
})

watch(sidebarCollapsed, (collapsed) => {
  localStorage.setItem(sidebarStorageKey, String(collapsed))
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function expandSidebar() {
  sidebarCollapsed.value = false
  sidebarLogoHovered.value = false
}

function resetLinkForm(menuId = state.activeMenuId) {
  linkForm.title = ''
  linkForm.url = ''
  linkForm.description = ''
  linkForm.tags = []
  linkForm.menuId = menuId && menuId !== homeMenuId ? menuId : state.menus[0]?.id || ''
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
    state.activeMenuId = homeMenuId
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
  modalApi?.confirm?.({
    title: '清除前请先导出配置',
    content: '清除缓存会删除当前浏览器中的菜单、链接和设置，且无法恢复。建议先点击“导出配置”完成备份，确认后再继续。',
    okText: '确认清除',
    cancelText: '先导出 / 取消',
    okType: 'danger',
    onOk: () => {
      localStorage.removeItem(storageKey)
      applySeedData()
      setToast('已清除缓存并恢复默认')
    },
  })
}

function warnBeforeBrowserDataClear(event) {
  if (!state.menus.length && !state.links.length) return undefined
  const warning = '当前工作台数据保存在浏览器本地。若要清理浏览器缓存，请先导出配置，否则数据可能丢失。'
  event.preventDefault()
  event.returnValue = warning
  return warning
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
  return list.filter((item) => item.id !== 'links').map((item) => ({
    ...item,
    icon: item.icon || 'AppstoreOutlined',
  }))
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
  state.activeMenuId = homeMenuId
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
      const resolvedLinks = (parsed.links?.length ? parsed.links : [...seedLinks]).filter((link) => link.menuId !== 'links')
      const resolvedSettings = { ...seedSettings, ...(parsed.settings || {}) }
      const validTheme = ['light', 'dark', 'system'].includes(resolvedSettings.theme)
        ? resolvedSettings.theme
        : 'system'
      setTheme(validTheme)
      const requestedActiveMenuId = parsed.activeMenuId || parsed.menus?.[0]?.id || homeMenuId
      const resolvedActiveMenuId = resolvedMenus.some((menu) => menu.id === requestedActiveMenuId)
        ? requestedActiveMenuId
        : homeMenuId
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
  <div class="app-shell" :class="{ 'app-shell--sidebar-collapsed': sidebarCollapsed }" :style="themeVars">
      <aside class="sidebar sidebar--compact" :class="{ 'sidebar--collapsed': sidebarCollapsed }">
        <div
          class="brand"
          :class="{ 'brand--collapsed': sidebarCollapsed }"
          @mouseenter="sidebarCollapsed && (sidebarLogoHovered = true)"
          @mouseleave="sidebarLogoHovered = false"
        >
          <img v-if="!sidebarCollapsed || !sidebarLogoHovered" class="brand__logo" :src="brandLogo" alt="Altr Logo" />
          <Button
            v-else
            class="sidebar-toggle-btn sidebar-toggle-btn--expand"
            shape="circle"
            type="text"
            size="middle"
            :icon="h(MenuUnfoldOutlined)"
            aria-label="展开侧边栏"
            @click="expandSidebar"
          />
          <Button
            v-if="!sidebarCollapsed"
            class="sidebar-toggle-btn"
            shape="circle"
            type="text"
            size="middle"
            :icon="h(MenuFoldOutlined)"
            aria-label="收起侧边栏"
            @click="toggleSidebar"
          />
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
          :disable-edit-ids="[]"
          :collapsed="sidebarCollapsed"
          :home-id="homeMenuId"
          :about-id="aboutMenuId"
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
            <h1>{{ isAboutPage ? '关于本站' : '链接聚合' }}</h1>
          </div>
          <Space v-if="!isAboutPage" class="header__actions" wrap>
            <Tooltip title="开启后支持左侧菜单和右侧内容拖拽排序">
              <Space size="small">
                <span class="muted">拖拽排序</span>
                <Switch ref="dragSwitchRef" v-model:checked="state.settings.enableDrag" />
              </Space>
            </Tooltip>
            <Button ref="newLinkBtnRef" type="primary" size="middle" @click="openNewLink" :icon="h(PlusOutlined)">新增链接</Button>
            <Button ref="settingBtnRef" size="middle" @click="settingDrawerOpen = true" :icon="h(SettingOutlined)">配置项</Button>
          </Space>
        </header>

        <template v-if="!isAboutPage">
        <div class="toolbar">
          <Input
            v-model:value="state.search"
            allow-clear
            size="middle"
            class="search-input"
            style="width: 240px"
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
        <footer class="content-footer" aria-live="polite">
          {{ motivationalQuotes[currentQuoteIndex] }}
        </footer>
        </template>
        <section v-else class="about-page" aria-label="关于本站">
          <p>感谢你的来访。</p>
          <p>聚合工作台是一个轻量的个人链接管理工具，用来集中整理日常使用的网站、工具和资料，让常用入口更容易找到，也更方便维护。</p>
          <p>如果你喜欢本站，欢迎将本站添加到收藏夹（快捷键 Ctrl+D），也可以设为浏览器主页，方便下次访问。感谢你的支持。</p>

          <h3>你可以用它做什么</h3>
          <p>通过菜单对链接进行分组，使用标签和关键词快速筛选内容；也可以新增、编辑、删除链接和菜单，并按照自己的习惯调整顺序。</p>
          <p>工作台支持拖拽排序、主题切换、卡片列数、紧凑模式和描述显示等设置，适配不同的使用习惯和信息密度。</p>
          <p>菜单、链接和界面设置会保存在当前浏览器的本地存储中，也支持导入和导出配置，方便备份或迁移到其他环境。</p>

          <h3>隐私说明</h3>
          <p>本站本身不需要账号，应用数据默认保存在当前浏览器本地，不会主动上传到应用服务器。打开链接后，目标网站可能会按照其自身的隐私政策处理访问数据。</p>
        </section>
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
