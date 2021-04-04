import { createApp } from 'vue';
import App from './App.vue';
import 'virtual:windi.css';

createApp(App).mount('#app');

if (process.env.NODE_ENV === 'development' && window.global) {
  // polyfill の影響で HMR ランタイムが window.global (ブラウザにおけるグローバルではない)に
  // 飛んでしまうため、本来のグローバル環境に移し替える
  // @ts-ignore
  window.__VUE_HMR_RUNTIME__ = window.global.__VUE_HMR_RUNTIME__;
}
