<script setup>
import { computed } from 'vue'

const props = defineProps({
  links: { type: Array, default: () => [] },
  canDrag: { type: Boolean, default: false },
  dense: { type: Boolean, default: false },
  showDescription: { type: Boolean, default: true },
  getTagStyle: { type: Function, default: () => ({}) },
})

const emit = defineEmits(['open', 'edit', 'delete', 'drag-start', 'drag-end', 'drop', 'copy-title'])

const denseClass = computed(() => (props.dense ? 'card--dense' : ''))

const getInitial = (title = '') => {
  const trimmed = title.trim()
  return trimmed ? trimmed[0] : '?'
}
</script>

<template>
  <div class="card-grid" :class="{ 'card-grid--dense': dense }">
    <a-card
      v-for="link in links"
      :key="link.id"
      class="card card--list"
      :class="denseClass"
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
            <p class="card__title">{{ link.title }}</p>
            <p v-if="showDescription" class="card__desc">{{ link.description }}</p>
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
