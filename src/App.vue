<script setup>
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import { App as AntApp, Button, Card, Checkbox, Drawer, Input, Modal, Popconfirm, Select, Slider, Space, Switch, Tag, Tooltip } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined, PushpinFilled, UploadOutlined, DownloadOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { useTheme } from './composables/useTheme'

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
const linkFormRef = ref(null)
const menuFormRef = ref(null)
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

async function handleLinkOk() {
  try {
    await linkFormRef.value?.validate()
    submitLink()
  } catch (err) {
    messageApi?.error?.('请完善必填项')
  }
}

async function handleMenuOk() {
  try {
    await menuFormRef.value?.validate()
    submitMenu()
  } catch (err) {
    messageApi?.error?.('请检查菜单名称')
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
        <div class="menu-list">
          <Card
            v-for="menu in state.menus"
            :key="menu.id"
            size="small"
            class="menu-item"
            :bordered="menu.id === state.activeMenuId"
            :class="{ active: menu.id === state.activeMenuId }"
            :bodyStyle="{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }"
            @click="state.activeMenuId = menu.id"
            :draggable="canDrag"
            @dragstart="startMenuDrag(menu.id)"
            @dragend="draggingMenuId = null"
            @dragover.prevent
            @drop.prevent="dropMenu(menu.id)"
            :style="{ borderColor: menu.id === state.activeMenuId ? state.settings.accent : 'var(--line)' }"
          >
            <div class="menu-text">
              <span>{{ menu.name }}</span>
              <Tag v-if="state.settings.showMenuCount">{{ state.links.filter((l) => l.menuId === menu.id).length }}</Tag>
            </div>
            <Space class="menu-actions" @click.stop>
              <Tooltip title="编辑">
                <Button type="text" size="small" @click="openEditMenu(menu)" :icon="h(EditOutlined)" />
              </Tooltip>
              <Popconfirm title="确认删除此菜单？" ok-text="删除" cancel-text="取消" @confirm="deleteMenu(menu.id)">
                <Button type="text" danger size="small" :icon="h(DeleteOutlined)" />
              </Popconfirm>
            </Space>
          </Card>
        </div>
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

        <div
          class="card-grid"
          :style="{ gridTemplateColumns: `repeat(${state.settings.columns}, minmax(0, 1fr))` }"
        >
          <Card
            v-for="link in filteredLinks"
            :key="link.id"
            class="card"
            :class="denseClass"
            :bordered="true"
            :draggable="canDrag"
            @dragstart="startLinkDrag(link.id)"
            @dragend="draggingLinkId = null"
            @dragover.prevent
            @drop.prevent="dropLink(link.id)"
          >
            <template #title>
              <p class="card__title" style="cursor: pointer" @click.stop="copyTitle(link.title)">{{ link.title }}</p>
            </template>
            <div class="card__tags">
              <Tag v-for="tag in link.tags" :key="tag" :style="getTagStyle(tag)">{{ tag }}</Tag>
            </div>
            <p v-if="state.settings.showDescription" class="card__desc">{{ link.description }}</p>
            <div class="card__meta">{{ link.url }}</div>
            <div class="card__footer">
              <span style="color: #1677ff; margin-right: 10px; cursor: pointer;" @click="openLink(link.url)">打开</span>
              <Button type="link" @click="openEditLink(link)">编辑</Button>
              <Popconfirm title="确认删除此链接？" ok-text="删除" cancel-text="取消" @confirm="deleteLink(link.id)">
                <Button type="link" danger>删除</Button>
              </Popconfirm>
            </div>
          </Card>

        </div>
      </main>

      <Modal
        v-model:open="linkModalOpen"
        :title="editingLinkId ? '编辑链接' : '新增链接'"
        @ok="handleLinkOk"
        @cancel="linkModalOpen = false"
        ok-text="保存"
        cancel-text="取消"
      >
        <a-form
          ref="linkFormRef"
          :model="linkForm"
          :rules="linkRules"
          layout="horizontal"
          :label-col="formLayout.labelCol"
          :wrapper-col="formLayout.wrapperCol"
          :label-align="formLayout.labelAlign"
        >
          <a-form-item label="标题" name="title">
            <a-input v-model:value="linkForm.title" placeholder="展示的名称" />
          </a-form-item>
          <a-form-item label="链接" name="url">
            <a-input v-model:value="linkForm.url" placeholder="https://" />
          </a-form-item>
          <a-form-item label="描述" name="description">
            <a-textarea
              v-model:value="linkForm.description"
              rows="2"
              placeholder="一句话介绍用途"
              :maxlength="100"
              show-count
            />
          </a-form-item>
          <a-form-item label="标签">
            <a-input v-model:value="linkForm.tagsText" placeholder="项目, 协同" />
          </a-form-item>
          <a-form-item label="所属菜单" name="menuId">
            <a-select v-model:value="linkForm.menuId">
              <a-select-option v-for="menu in state.menus" :key="menu.id" :value="menu.id">{{ menu.name }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </Modal>

      <Modal
        v-model:open="menuModalOpen"
        :title="editingMenuId ? '编辑菜单' : '新增菜单'"
        @ok="handleMenuOk"
        @cancel="menuModalOpen = false"
        ok-text="保存"
        cancel-text="取消"
      >
        <a-form
          ref="menuFormRef"
          :model="menuForm"
          :rules="menuRules"
          layout="horizontal"
          :label-col="formLayout.labelCol"
          :wrapper-col="formLayout.wrapperCol"
          :label-align="formLayout.labelAlign"
        >
          <a-form-item label="名称" name="name" :required="true">
            <a-input v-model:value="menuForm.name" placeholder="例如：数据分析" :maxlength="4" />
          </a-form-item>
        </a-form>
      </Modal>

      <Drawer
        v-model:open="settingDrawerOpen"
        title="配置项"
        placement="right"
        :width="'40%'"
        :closable="true"
      >
        <a-form
          layout="horizontal"
          class="drawer-form"
          :label-col="formLayout.labelCol"
          :wrapper-col="formLayout.wrapperCol"
          :label-align="formLayout.labelAlign"
        >
          <a-form-item label="主题">
            <a-select v-model:value="themeValue">
              <a-select-option value="light">明亮</a-select-option>
              <a-select-option value="dark">暗色</a-select-option>
              <a-select-option value="system">跟随系统</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="列数">
            <a-slider v-model:value="state.settings.columns" :min="2" :max="4" />
          </a-form-item>
          <a-form-item label="紧凑模式">
            <a-checkbox v-model:checked="state.settings.dense" />
          </a-form-item>
          <a-form-item label="显示描述">
            <a-checkbox v-model:checked="state.settings.showDescription" />
          </a-form-item>
          <a-form-item label="显示菜单数量">
            <a-checkbox v-model:checked="state.settings.showMenuCount" />
          </a-form-item>
          <a-form-item label="配置">
            <Space>
              <Button size="large" :icon="h(DownloadOutlined)" @click="exportConfig">导出配置</Button>
              <Button size="large" :icon="h(UploadOutlined)" @click="triggerImport">导入配置</Button>
              <Button size="large" danger ghost @click="clearCache">清除缓存</Button>
            </Space>
          </a-form-item>
        </a-form>
      </Drawer>
    </div>
</template>
<style scoped lang="scss">
:deep(.ant-card-body){
  padding: 0 24px;
}
</style>
