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
</script>

<template>
  <div class="card-grid" :class="{ 'card-grid--dense': dense }">
    <a-card
      v-for="link in links"
      :key="link.id"
      class="card"
      :class="denseClass"
      :bordered="true"
      :draggable="canDrag"
      @dragstart="emit('drag-start', link.id)"
      @dragend="emit('drag-end')"
      @dragover.prevent
      @drop.prevent="emit('drop', link.id)"
    >
      <template #title>
        <p class="card__title" style="cursor: pointer" @click.stop="emit('copy-title', link.title)">{{ link.title }}</p>
      </template>
      <div class="card__tags">
        <a-tag v-for="tag in link.tags" :key="tag" :style="getTagStyle(tag)">{{ tag }}</a-tag>
      </div>
      <p v-if="showDescription" class="card__desc">{{ link.description }}</p>
      <div class="card__meta">{{ link.url }}</div>
      <div class="card__footer">
        <a-space class="foot-actions" size="small">
          <span style="color: #1677ff; cursor: pointer;margin-right: 6px;" @click="emit('open', link.url)">打开</span>
          <a-button type="link" @click="emit('edit', link)">编辑</a-button>
          <a-popconfirm title="确认删除此链接？" ok-text="删除" cancel-text="取消" @confirm="emit('delete', link.id)">
            <a-button type="link" danger>删除</a-button>
          </a-popconfirm>
        </a-space>
      </div>
    </a-card>
  </div>
</template>


<style scoped lang="scss">
:deep(.ant-card-body){
  padding: 0 24px 10px 24px;
}
</style>