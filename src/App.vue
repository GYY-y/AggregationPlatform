<script setup>
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import { App as AntApp, Button, Input, Space, Switch, Tag } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { useTheme } from './composables/useTheme'
import MenuList from './components/MenuList.vue'
import LinkGrid from './components/LinkGrid.vue'
import LinkFormModal from './components/LinkFormModal.vue'
import MenuFormModal from './components/MenuFormModal.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'

const storageKey = 'aggregation-platform-state'

const seedMenus = [
  { id: 'wk', name: '工作效率' },
  { id: 'dev', name: '开发工具' },
  { id: 'ref', name: '学习资料' },
]

const seedLinks = [
  {
    id: 'notion',
    menuId: 'wk',
    title: 'Notion 团队空间',
    url: 'https://www.notion.so/',
    description: '团队知识库与任务协同的主页。',
    tags: ['文档', '协同'],
  },
  {
    id: 'linear',
    menuId: 'wk',
    title: 'Linear 项目板',
    url: 'https://linear.app/',
    description: '项目进度、需求与缺陷的统一入口。',
    tags: ['项目', '看板'],
  },
  {
    id: 'github',
    menuId: 'dev',
    title: 'GitHub',
    url: 'https://github.com/',
    description: '代码仓库与 PR 汇总。',
    tags: ['代码', '版本控制'],
  },
  {
    id: 'figma',
    menuId: 'ref',
    title: 'Figma 设计稿',
    url: 'https://www.figma.com/',
    description: '设计规范与最新交互稿集合。',
    tags: ['设计', '规范'],
  },
]

const seedSettings = {
  columns: 3,
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
  menus: [...seedMenus],
  links: [...seedLinks],
  settings: { ...seedSettings },
  activeMenuId: 'wk',
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
  tagsText: '',
  menuId: '',
})

const menuForm = reactive({
  name: '',
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
  state.links.forEach((l) => l.tags.forEach((t) => tagSet.add(t)))
  return Array.from(tagSet)
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
  try {
    const cache = localStorage.getItem(storageKey)
    if (cache) {
      const parsed = JSON.parse(cache)
      state.menus = parsed.menus?.length ? parsed.menus : seedMenus
      state.links = parsed.links?.length ? parsed.links : seedLinks
      state.settings = { ...seedSettings, ...(parsed.settings || {}) }
      state.activeMenuId = parsed.activeMenuId || parsed.menus?.[0]?.id || seedMenus[0].id
      if (parsed.settings?.theme) {
        setTheme(['light', 'dark', 'system'].includes(parsed.settings.theme) ? parsed.settings.theme : 'system')
      }
    }
  } catch (err) {
    console.warn('读取缓存失败', err)
  }
  if (!state.activeMenuId && state.menus.length) {
    state.activeMenuId = state.menus[0].id
  }
})

function resetLinkForm(menuId = state.activeMenuId) {
  linkForm.title = ''
  linkForm.url = ''
  linkForm.description = ''
  linkForm.tagsText = ''
  linkForm.menuId = menuId || state.menus[0]?.id || ''
}

function resetMenuForm() {
  menuForm.name = ''
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
  linkForm.tagsText = link.tags.join(', ')
  linkForm.menuId = link.menuId
  linkModalOpen.value = true
}

function submitLink() {
  const tags = linkForm.tagsText
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

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
  menuModalOpen.value = true
}

function submitMenu() {
  const name = menuForm.name.trim()
  if (!name) return setToast('请输入菜单名称')
  if (name.length > 4) return setToast('名称最多 4 个字')

  if (editingMenuId.value) {
    const target = state.menus.find((m) => m.id === editingMenuId.value)
    if (target) target.name = name
  } else {
    const id = createId()
    state.menus.push({ id, name })
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
  state.menus = moveItem(state.menus, draggingMenuId.value, targetId)
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
      state.menus = parsed.menus
      state.links = parsed.links
      state.settings = { ...seedSettings, ...(parsed.settings || {}) }
      if (state.settings.theme) {
        setTheme(['light', 'dark', 'system'].includes(state.settings.theme) ? state.settings.theme : 'system')
      }
      state.activeMenuId = parsed.activeMenuId || parsed.menus?.[0]?.id || ''
      setToast('已导入配置')
    } catch (err) {
      console.error(err)
      setToast('导入失败：请检查 JSON')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

function clearCache() {
  localStorage.removeItem(storageKey)
  state.menus = [...seedMenus]
  state.links = [...seedLinks]
  state.settings = { ...seedSettings }
  state.activeMenuId = seedMenus[0].id
  state.search = ''
  setTheme(seedSettings.theme)
  state.settings.accent = seedSettings.accent
  setToast('已清除缓存并恢复默认')
}

function setToast(message) {
  messageApi?.success?.(message)
}

function createId() {
  return Math.random().toString(36).slice(2, 8)
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
</script>

<template>
  <div class="app-shell" :style="themeVars">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand__dot" />
          <div>
            <p class="brand__title">聚合工作台</p>
            <p class="brand__subtitle">链接一处，直达所需</p>
          </div>
        </div>
        <div class="sidebar__actions">
          <Button block type="primary" size="large" @click="openNewMenu">新增菜单</Button>
        </div>
        <input ref="importInput" type="file" accept="application/json" class="hidden" @change="handleImport" />
        <MenuList
          :menus="state.menus"
          :active-menu-id="state.activeMenuId"
          :show-menu-count="state.settings.showMenuCount"
          :menu-link-count="menuLinkCount"
          :can-drag="canDrag"
          :accent="state.settings.accent"
          :edit-icon="h(EditOutlined)"
          :delete-icon="h(DeleteOutlined)"
          @select="state.activeMenuId = $event"
          @edit="openEditMenu"
          @delete="deleteMenu"
          @drag-start="startMenuDrag"
          @drag-end="draggingMenuId = null"
          @drop="dropMenu"
        />
      </aside>

      <main class="content">
        <header class="header">
          <div>
            <h1>链接聚合</h1>
            <p class="muted">固定常用、分组管理、随时导入导出配置。</p>
          </div>
      <Space class="header__actions" wrap>
        <Button type="primary" size="large" @click="openNewLink" :icon="h(PlusOutlined)">新增链接</Button>
        <Button size="large" @click="settingDrawerOpen = true" :icon="h(SettingOutlined)">配置项</Button>
      </Space>
        </header>

        <div class="toolbar">
          <Input
            v-model:value="state.search"
            allow-clear
            size="large"
            style="width: 280px"
            placeholder="搜索标题、标签"
          />
          <Space size="middle">
            <span class="muted">允许拖拽</span>
            <Switch v-model:checked="state.settings.enableDrag" />
          </Space>
          <div class="tag-row">
            <span class="muted">标签:</span>
            <span v-if="!availableTags.length" class="muted">暂无</span>
            <Tag v-for="tag in availableTags" :key="tag" :style="getTagStyle(tag)">{{ tag }}</Tag>
          </div>
        </div>

        <LinkGrid
          :links="filteredLinks"
          :can-drag="canDrag"
          :dense="state.settings.dense"
          :show-description="state.settings.showDescription"
          :style="{ gridTemplateColumns: `repeat(${state.settings.columns}, minmax(0, 1fr))` }"
          :get-tag-style="getTagStyle"
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
        @submit="submitLink"
      />

      <MenuFormModal
        v-model:open="menuModalOpen"
        :title="editingMenuId ? '编辑菜单' : '新增菜单'"
        :menu-form="menuForm"
        :menu-rules="menuRules"
        :form-layout="formLayout"
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
    </div>
</template>
<!-- <style scoped lang="scss">
:deep(.ant-card-body){
  padding: 0 24px;
}
</style> -->
