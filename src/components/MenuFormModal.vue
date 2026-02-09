<script setup>
import { App as AntApp } from 'ant-design-vue'
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  menuForm: { type: Object, required: true },
  menuRules: { type: Object, default: () => ({}) },
  formLayout: { type: Object, default: () => ({}) },
  iconOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:open', 'submit'])
const menuFormRef = ref(null)
const { message } = AntApp.useApp()

const handleCancel = () => emit('update:open', false)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    nextTick(() => menuFormRef.value?.clearValidate())
  }
)

async function handleOk() {
  try {
    await menuFormRef.value?.validate()
    emit('submit')
  } catch (err) {
    message?.error?.('请完善必填项')
  }
}

defineExpose({ validate: () => menuFormRef.value?.validate() })
</script>

<template>
  <a-modal
    :open="open"
    :title="title"
    :mask-closable="false"
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
      <a-form-item label="菜单图标" name="icon" :required="true">
        <a-select v-model:value="menuForm.icon" placeholder="请选择图标" option-label-prop="label">
          <a-select-option
            v-for="item in iconOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          >
            <component :is="item.icon" class="menu-icon-option" />
            <span>{{ item.label }}</span>
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="菜单名称" name="name" :required="true">
        <a-input v-model:value="menuForm.name" placeholder="例如：数据分析" :maxlength="4" />
      </a-form-item>
  </a-form>
  </a-modal>
</template>

<style scoped lang="scss">
.menu-icon-option {
  margin-right: 8px;
  font-size: 16px;
  vertical-align: middle;
}
</style>
