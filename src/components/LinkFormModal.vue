<script setup>
import { App as AntApp } from 'ant-design-vue'
import { ref } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  linkForm: { type: Object, required: true },
  linkRules: { type: Object, default: () => ({}) },
  formLayout: { type: Object, default: () => ({}) },
  menus: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:open', 'submit'])
const linkFormRef = ref(null)
const { message } = AntApp.useApp()

const handleCancel = () => emit('update:open', false)

async function handleOk() {
  try {
    await linkFormRef.value?.validate()
    emit('submit')
  } catch (err) {
    message?.error?.('请完善必填项')
  }
}

defineExpose({ validate: () => linkFormRef.value?.validate() })
</script>

<template>
  <a-modal
    :open="open"
    :title="title"
    ok-text="保存"
    cancel-text="取消"
    @ok="handleOk"
    @cancel="handleCancel"
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
          <a-select-option v-for="menu in menus" :key="menu.id" :value="menu.id">{{ menu.name }}</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
