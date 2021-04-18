<template>
  <button class="px-4 py-2 bg-white rounded" @click="logIn">ログインする</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ServiceKeys, useService } from '../../compositions/ServiceProvider';

export default defineComponent({
  setup() {
    const authService = useService(ServiceKeys.authService);
    const logIn = () => authService.loginWithGoogle();

    return {
      logIn,
    };
  },
});
</script>
