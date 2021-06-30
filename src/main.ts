import { createApp } from 'vue';
import App from './App.vue';
import 'virtual:windi.css';
import { registerSW } from 'virtual:pwa-register';

// Fix viewport height for mobile devices (address bar affect viewport height)
// https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
const viewportHeightFixStyle = document.createElement('style');
document.head.appendChild(viewportHeightFixStyle);
const onViewportHeightChange = () => {
  const vh = window.innerHeight * 0.01;
  viewportHeightFixStyle.innerHTML = `:root { --vh: ${vh}px }`;
};
window.addEventListener('resize', onViewportHeightChange);
onViewportHeightChange();

// register service worker by vite-plugin-pwa
registerSW();

createApp(App).mount('#app');

if (import.meta.env.DEV && window.global) {
  // polyfill の影響で HMR ランタイムが window.global (ブラウザにおけるグローバルではない)に
  // 飛んでしまうため、本来のグローバル環境に移し替える
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.__VUE_HMR_RUNTIME__ = window.global.__VUE_HMR_RUNTIME__;
}
