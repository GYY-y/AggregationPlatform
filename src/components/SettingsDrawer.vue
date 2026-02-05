<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  formLayout: { type: Object, default: () => ({}) },
  settings: { type: Object, required: true },
  themeValue: { type: [String, Number], default: 'system' },
})

const emit = defineEmits(['update:open', 'update:themeValue', 'export', 'import', 'clear'])
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
        <a-slider v-model:value="settings.columns" :min="2" :max="4" />
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
      <a-form-item label="配置">
        <a-space>
          <a-button size="large" @click="emit('export')">导出配置</a-button>
          <a-button size="large" @click="emit('import')">导入配置</a-button>
          <a-button size="large" danger ghost @click="emit('clear')">清除缓存</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>
