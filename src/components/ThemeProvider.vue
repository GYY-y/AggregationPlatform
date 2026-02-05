<script setup>
import { ConfigProvider, App as AntApp } from 'ant-design-vue'
import { useTheme } from '../composables/useTheme'
import App from '../App.vue'

const { algorithm } = useTheme()
</script>

<template>
  <ConfigProvider :theme="{ algorithm }">
    <AntApp>
      <App />
    </AntApp>
  </ConfigProvider>
</template>
