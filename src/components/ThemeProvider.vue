<script setup>
import { ConfigProvider, App as AntApp } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { useTheme } from '../composables/useTheme'
import App from '../App.vue'

const { algorithm } = useTheme()
</script>

<template>
  <ConfigProvider :theme="{ algorithm }" :locale="zhCN">
    <AntApp>
      <App />
    </AntApp>
  </ConfigProvider>
</template>
