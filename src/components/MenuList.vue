<script setup>
const props = defineProps({
  menus: { type: Array, default: () => [] },
  activeMenuId: { type: String, default: '' },
  showMenuCount: { type: Boolean, default: false },
  menuLinkCount: { type: Object, default: () => ({}) },
  canDrag: { type: Boolean, default: false },
  accent: { type: String, default: '' },
  iconMap: { type: Object, default: () => ({}) },
  editIcon: { type: Object, default: null },
  deleteIcon: { type: Object, default: null },
  disableEditIds: { type: Array, default: () => [] },
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
      :bordered="false"
      :class="{ active: menu.id === activeMenuId }"
      :body-style="{ padding: '12px 10px' }"
      @click="emit('select', menu.id)"
      :draggable="canDrag"
      @dragstart="emit('drag-start', menu.id)"
      @dragend="emit('drag-end')"
      @dragover.prevent
      @drop.prevent="emit('drop', menu.id)"
    >
      <a-dropdown v-if="!disableEditIds.includes(menu.id)" :trigger="['contextmenu']">
        <div class="menu-card">
          <div class="menu-icon">
            <component :is="iconMap[menu.icon] || iconMap.default" />
          </div>
          <div class="menu-title">{{ menu.name }}</div>
          <a-tag v-if="showMenuCount" class="menu-count">{{ getCount(menu.id) }}</a-tag>
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item @click="emit('edit', menu)">编辑</a-menu-item>
            <a-menu-item class="menu-item--danger">
              <a-popconfirm title="确认删除此菜单？" ok-text="删除" cancel-text="取消" @confirm="emit('delete', menu.id)">
                <span>删除</span>
              </a-popconfirm>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <div v-else class="menu-card">
        <div class="menu-icon">
          <component :is="iconMap[menu.icon] || iconMap.default" />
        </div>
        <div class="menu-title">{{ menu.name }}</div>
        <a-tag v-if="showMenuCount" class="menu-count">{{ getCount(menu.id) }}</a-tag>
      </div>
    </a-card>
  </div>
</template>

<style scoped lang="scss">
.menu-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  position: relative;
  padding-bottom: 4px;
  &:hover .menu-actions {
    opacity: 1;
    visibility: visible;
  }
}

.menu-icon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.menu-title {
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  color: inherit;
}

.menu-count {
  display: none;
}

:deep(.ant-dropdown-menu-item.menu-item--danger) {
  color: #ff4d4f;
}

:deep(.ant-dropdown-menu-item.menu-item--danger:hover) {
  color: #ff4d4f;
}

:deep(.ant-card-body){
  padding: 0 !important;
  width: 100%;
}
</style>
