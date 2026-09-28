<script setup>
import { ReloadOutlined } from '@ant-design/icons-vue'

const defaultContentBackground = '#fcfcfc'

const props = defineProps({
  open: { type: Boolean, default: false },
  formLayout: { type: Object, default: () => ({}) },
  settings: { type: Object, required: true },
  themeValue: { type: [String, Number], default: 'system' },
})

const emit = defineEmits(['update:open', 'update:themeValue', 'export', 'import', 'clear'])

const resetContentBackground = () => {
  props.settings.contentBackground = defaultContentBackground
}
</script>

<template>
  <a-drawer
    :open="open"
    title="配置项"
    placement="right"
    :width="'40%'"
    :closable="true"
    @close="emit('update:open', false)"
  >
    <a-form
      layout="horizontal"
      class="drawer-form"
      :label-col="formLayout.labelCol"
      :wrapper-col="formLayout.wrapperCol"
      :label-align="formLayout.labelAlign"
    >
      <a-form-item label="主题">
        <a-select :value="themeValue" @update:value="emit('update:themeValue', $event)">
          <a-select-option value="light">明亮</a-select-option>
          <a-select-option value="dark">暗色</a-select-option>
          <a-select-option value="system">跟随系统</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="列数">
        <a-slider v-model:value="settings.columns" :min="2" :max="5" />
      </a-form-item>
      <a-form-item label="紧凑模式">
        <a-checkbox v-model:checked="settings.dense" />
      </a-form-item>
      <a-form-item label="显示描述">
        <a-checkbox v-model:checked="settings.showDescription" />
      </a-form-item>
      <a-form-item label="显示菜单数量">
        <a-checkbox v-model:checked="settings.showMenuCount" />
      </a-form-item>
      <a-form-item label="内容背景色">
        <div class="color-setting">
          <input v-model="settings.contentBackground" type="color" aria-label="选择内容背景色" />
          <span>{{ settings.contentBackground }}</span>
          <a-tooltip title="恢复默认背景色">
            <a-button
              type="text"
              size="small"
              aria-label="恢复默认背景色"
              @click="resetContentBackground"
            >
              <ReloadOutlined />
            </a-button>
          </a-tooltip>
        </div>
      </a-form-item>
      <a-form-item label="配置">
        <a-space>
          <a-button size="middle" @click="emit('export')">导出配置</a-button>
          <a-button size="middle" @click="emit('import')">导入配置</a-button>
          <a-button size="middle" danger ghost @click="emit('clear')">清除缓存</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<style scoped>
.color-setting {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.color-setting input {
  width: 36px;
  height: 30px;
  padding: 2px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}

.color-setting span {
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
}

.color-setting :deep(.ant-btn) {
  color: var(--muted);
}

.color-setting :deep(.ant-btn:hover) {
  color: var(--text);
  background: var(--surface-alt);
}
</style>
