import { createApp } from 'vue';
import App from './App.vue';
import 'virtual:windi.css';

createApp(App).mount('#app');

if (import.meta.env.DEV && window.global) {
  // polyfill の影響で HMR ランタイムが window.global (ブラウザにおけるグローバルではない)に
  // 飛んでしまうため、本来のグローバル環境に移し替える
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.__VUE_HMR_RUNTIME__ = window.global.__VUE_HMR_RUNTIME__;
}
