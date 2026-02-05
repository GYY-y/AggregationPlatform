<script setup>
const props = defineProps({
  menus: { type: Array, default: () => [] },
  activeMenuId: { type: String, default: '' },
  showMenuCount: { type: Boolean, default: false },
  menuLinkCount: { type: Object, default: () => ({}) },
  canDrag: { type: Boolean, default: false },
  accent: { type: String, default: '' },
  editIcon: { type: Object, default: null },
  deleteIcon: { type: Object, default: null },
})

const emit = defineEmits(['select', 'edit', 'delete', 'drag-start', 'drag-end', 'drop'])

const getCount = (id) => props.menuLinkCount[id] || 0
</script>

<template>
  <div class="menu-list">
    <a-card
      v-for="menu in menus"
      :key="menu.id"
      size="small"
      class="menu-item"
      :bordered="menu.id === activeMenuId"
      :class="{ active: menu.id === activeMenuId }"
      :body-style="{ padding: '10px 12px' }"
      @click="emit('select', menu.id)"
      :draggable="canDrag"
      @dragstart="emit('drag-start', menu.id)"
      @dragend="emit('drag-end')"
      @dragover.prevent
      @drop.prevent="emit('drop', menu.id)"
      :style="{ borderColor: menu.id === activeMenuId ? accent : 'var(--line)' }"
    >
      <div class="menu-row">
        <div class="menu-text">
          <span>{{ menu.name }}</span>
          <a-tag v-if="showMenuCount">{{ getCount(menu.id) }}</a-tag>
        </div>
        <a-space class="menu-actions" @click.stop>
          <a-tooltip title="编辑">
            <a-button type="text" size="small" @click="emit('edit', menu)" :icon="editIcon" />
          </a-tooltip>
          <a-popconfirm title="确认删除此菜单？" ok-text="删除" cancel-text="取消" @confirm="emit('delete', menu.id)">
            <a-button type="text" danger size="small" @click.stop :icon="deleteIcon" />
          </a-popconfirm>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<style scoped lang="scss">
.menu-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  &:hover .menu-actions {
    opacity: 1;
    visibility: visible;
  }
}

.menu-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-actions {
  margin-left: auto;
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: flex-end;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
}

:deep(.ant-card-body){
  padding: 0 !important;
  width: 100%;
}
</style>
