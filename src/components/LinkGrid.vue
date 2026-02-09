<script setup>
import { computed } from 'vue'

const props = defineProps({
  links: { type: Array, default: () => [] },
  canDrag: { type: Boolean, default: false },
  dense: { type: Boolean, default: false },
  showDescription: { type: Boolean, default: true },
  getTagStyle: { type: Function, default: () => ({}) },
  activeTag: { type: String, default: '' },
})

const emit = defineEmits(['open', 'edit', 'delete', 'drag-start', 'drag-end', 'drop', 'copy-title'])

const denseClass = computed(() => (props.dense ? 'card--dense' : ''))

const getInitial = (title = '') => {
  const trimmed = title.trim()
  return trimmed ? trimmed[0] : '?'
}

const toRgba = (color, alpha = 0.12) => {
  if (!color) return ''
  const trimmed = color.trim()
  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1)
    const normalized = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex
    if (normalized.length !== 6) return ''
    const r = parseInt(normalized.slice(0, 2), 16)
    const g = parseInt(normalized.slice(2, 4), 16)
    const b = parseInt(normalized.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  if (trimmed.startsWith('rgb')) {
    const parts = trimmed.match(/\d+/g)
    if (!parts || parts.length < 3) return ''
    const [r, g, b] = parts
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return ''
}

const getCardStyle = (link) => {
  if (!props.activeTag) return {}
  const primaryTag = props.activeTag
  const tagStyle = props.getTagStyle(primaryTag) || {}
  const baseColor = tagStyle.backgroundColor || tagStyle.background || ''
  const tint = toRgba(baseColor, 0.14)
  return tint ? { '--tag-tint': tint } : {}
}
</script>

<template>
  <div class="card-grid" :class="{ 'card-grid--dense': dense }">
    <a-card
      v-for="link in links"
      :key="link.id"
      class="card card--list"
      :class="denseClass"
      :style="getCardStyle(link)"
      :bordered="true"
      :draggable="canDrag"
      @dragstart="emit('drag-start', link.id)"
      @dragend="emit('drag-end')"
      @dragover.prevent
      @drop.prevent="emit('drop', link.id)"
    >
      <a-dropdown :trigger="['contextmenu']">
        <div class="card__row">
          <div class="card__avatar" @click.stop="emit('copy-title', link.title)">
            {{ getInitial(link.title) }}
          </div>
          <div class="card__content" @click.stop="emit('open', link.url)">
            <p class="card__title card__title--truncate" @click.stop="emit('copy-title', link.title)">
              {{ link.title }}
            </p>
            <a-tooltip v-if="showDescription && link.description" :title="link.description">
              <p class="card__desc card__desc--truncate">{{ link.description }}</p>
            </a-tooltip>
          </div>
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item @click="emit('open', link.url)">打开</a-menu-item>
            <a-menu-item @click="emit('edit', link)">编辑</a-menu-item>
            <a-menu-item class="menu-item--danger">
              <a-popconfirm
                title="确认删除此链接？"
                ok-text="删除"
                cancel-text="取消"
                @confirm="emit('delete', link.id)"
              >
                <span>删除</span>
              </a-popconfirm>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </a-card>
  </div>
</template>


<style scoped lang="scss">
:deep(.ant-card-body){
  padding: 14px 18px;
}

:deep(.ant-dropdown-menu-item.menu-item--danger) {
  color: #ff4d4f;
}

:deep(.ant-dropdown-menu-item.menu-item--danger:hover) {
  color: #ff4d4f;
}
</style>
