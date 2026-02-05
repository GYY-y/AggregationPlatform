import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import ThemeProvider from './components/ThemeProvider.vue'
import './assets/main.css'

createApp(ThemeProvider).use(Antd).mount('#app')
