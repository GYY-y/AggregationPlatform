<script setup>
import { App as AntApp } from 'ant-design-vue'
import { ref } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  menuForm: { type: Object, required: true },
  menuRules: { type: Object, default: () => ({}) },
  formLayout: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:open', 'submit'])
const menuFormRef = ref(null)
const { message } = AntApp.useApp()

const handleCancel = () => emit('update:open', false)

async function handleOk() {
  try {
    await menuFormRef.value?.validate()
    emit('submit')
  } catch (err) {
    message?.error?.('请检查菜单名称')
  }
}

defineExpose({ validate: () => menuFormRef.value?.validate() })
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
      ref="menuFormRef"
      :model="menuForm"
      :rules="menuRules"
      layout="horizontal"
      :label-col="formLayout.labelCol"
      :wrapper-col="formLayout.wrapperCol"
      :label-align="formLayout.labelAlign"
    >
      <a-form-item label="菜单名称" name="name" :required="true">
        <a-input v-model:value="menuForm.name" placeholder="例如：数据分析" :maxlength="4" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
