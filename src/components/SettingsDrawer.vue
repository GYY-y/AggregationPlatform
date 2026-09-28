<script setup>
import { ref } from 'vue'
import { ReloadOutlined } from '@ant-design/icons-vue'

const defaultContentBackground = '#fcfcfc'

const props = defineProps({
  open: { type: Boolean, default: false },
  formLayout: { type: Object, default: () => ({}) },
  settings: { type: Object, required: true },
  themeValue: { type: [String, Number], default: 'system' },
})

const emit = defineEmits(['update:open', 'update:themeValue', 'export', 'import', 'clear'])
const backgroundInput = ref(null)

const triggerBackgroundUpload = () => {
  backgroundInput.value?.click()
}

const handleBackgroundUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => {
    const image = new Image()
    image.onload = () => {
      const maxSize = 1200
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
      props.settings.backgroundImage = canvas.toDataURL('image/jpeg', 0.58)
      props.settings.backgroundMode = 'image'
    }
    image.src = reader.result
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

const clearBackground = () => {
  props.settings.backgroundImage = ''
  props.settings.backgroundMode = 'color'
}

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
      <a-form-item label="背景样式">
        <a-tabs v-model:active-key="settings.backgroundMode" class="background-tabs">
          <a-tab-pane key="color" tab="内容背景色">
            <div class="color-setting">
              <input v-model="settings.contentBackground" type="color" aria-label="选择内容背景色" />
              <span>{{ settings.contentBackground }}</span>
              <a-tooltip title="恢复默认背景色">
                <a-button type="text" size="small" aria-label="恢复默认背景色" @click="resetContentBackground">
                  <ReloadOutlined />
                </a-button>
              </a-tooltip>
            </div>
          </a-tab-pane>
          <a-tab-pane key="image" tab="页面背景图">
            <div class="background-setting">
              <input ref="backgroundInput" class="background-file-input" type="file" accept="image/*" aria-label="上传页面背景图" @change="handleBackgroundUpload" />
              <a-button size="middle" @click="triggerBackgroundUpload">上传图片</a-button>
              <a-button v-if="settings.backgroundImage" size="middle" @click="clearBackground">移除背景图</a-button>
              <span v-else class="background-setting__hint">未设置</span>
            </div>
            <div v-if="settings.backgroundImage" class="slider-setting">
              <span class="slider-setting__label">模糊度</span>
              <a-slider v-model:value="settings.backgroundBlur" :min="0" :max="20" :step="1" />
              <span>{{ settings.backgroundBlur }}</span>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-form-item>
      <a-form-item label="配置">
        <a-space>
          <a-button size="middle" @click="emit('export')">导出配置</a-button>
          <a-button size="middle" @click="emit('import')">导入配置</a-button>
          <a-button size="middle" danger ghost @click="emit('clear')">清除缓存</a-button>
        </a-space>
      </a-form-item>
      <a-form-item class="storage-warning-item" :wrapper-col="formLayout.wrapperCol">
        <a-alert
          class="storage-warning"
          type="warning"
          show-icon
          message="数据保存在当前浏览器"
          description="清理浏览器缓存前，请先导出配置。浏览器无法在网页未打开时通知本站，因此导出文件是最可靠的备份方式。"
        />
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

.storage-warning {
  margin-bottom: 0;
}

.storage-warning-item {
  margin-top: -8px;
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

.background-setting {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.background-setting input {
  color: var(--muted);
  font-size: 12px;
}

.background-setting .background-file-input {
  display: none;
}

.background-setting__hint {
  color: var(--muted);
  font-size: 12px;
}

.slider-setting {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}

.slider-setting__label {
  color: var(--muted);
  font-size: 12px;
}

.slider-setting :deep(.ant-slider) {
  flex: 1;
  min-width: 120px;
}

.slider-setting span {
  min-width: 36px;
  color: var(--muted);
  font-size: 12px;
  text-align: right;
}
</style>
