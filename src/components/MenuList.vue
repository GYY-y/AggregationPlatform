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
  collapsed: { type: Boolean, default: false },
  homeId: { type: String, default: '__home__' },
})

const emit = defineEmits(['select', 'edit', 'delete', 'drag-start', 'drag-end', 'drop'])

const getCount = (id) => props.menuLinkCount[id] || 0
</script>

<template>
  <div class="menu-list" :class="{ 'menu-list--collapsed': collapsed }">
    <div
      class="menu-item menu-item--home"
      :class="{ active: homeId === activeMenuId, 'menu-item--collapsed': collapsed }"
      @click="emit('select', homeId)"
    >
      <a-tooltip :title="collapsed ? '首页' : undefined" placement="right">
        <div class="menu-card">
          <div class="menu-icon"><component :is="iconMap.home" /></div>
          <div v-if="!collapsed" class="menu-title">首页</div>
        </div>
      </a-tooltip>
    </div>
    <div
      v-for="menu in menus"
      :key="menu.id"
      class="menu-item"
      :class="{ active: menu.id === activeMenuId, 'menu-item--collapsed': collapsed }"
      @click="emit('select', menu.id)"
      :draggable="canDrag"
      @dragstart="emit('drag-start', menu.id)"
      @dragend="emit('drag-end')"
      @dragover.prevent
      @drop.prevent="emit('drop', menu.id)"
    >
      <a-dropdown v-if="!disableEditIds.includes(menu.id)" :trigger="['contextmenu']">
        <a-tooltip :title="collapsed ? menu.name : undefined" placement="right">
          <div class="menu-card">
            <div class="menu-icon">
              <component :is="iconMap[menu.icon] || iconMap.default" />
            </div>
            <div v-if="!collapsed" class="menu-title">{{ menu.name }}</div>
            <a-tag v-if="showMenuCount && !collapsed" class="menu-count">{{ getCount(menu.id) }}</a-tag>
          </div>
        </a-tooltip>
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
      <a-tooltip v-else :title="collapsed ? menu.name : undefined" placement="right">
        <div class="menu-card">
          <div class="menu-icon">
            <component :is="iconMap[menu.icon] || iconMap.default" />
          </div>
          <div v-if="!collapsed" class="menu-title">{{ menu.name }}</div>
          <a-tag v-if="showMenuCount && !collapsed" class="menu-count">{{ getCount(menu.id) }}</a-tag>
        </div>
      </a-tooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">
.menu-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  position: relative;
  padding: 2px 0;
  &:hover .menu-actions {
    opacity: 1;
    visibility: visible;
  }
}

.menu-icon {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  border-radius: 6px;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
}

.menu-title {
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  line-height: 1.2;
  color: inherit;
}

.menu-list--collapsed .menu-card {
  justify-content: center;
  padding: 2px 0;
}

:deep(.ant-tooltip-open) {
  display: block;
  width: 100%;
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

</style>
