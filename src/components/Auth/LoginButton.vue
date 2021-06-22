<template>
  <IconButton class="text-white" @click="logIn">
    <LoginBoxLine class="w-6 h-6 m-2" />
    <template v-slot:tooltip>
      <span>ログイン</span>
    </template>
  </IconButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ServiceKeys, useService } from '../../compositions/ServiceProvider';
import LoginBoxLine from '../../icons/RemixIcon/LoginBoxLine.vue';
import IconButton from '../IconButton.vue';

export default defineComponent({
  components: { IconButton, LoginBoxLine },
  setup() {
    const authService = useService(ServiceKeys.authService);
    const logIn = () => authService.loginWithGoogle();

    return {
      logIn,
    };
  },
});
</script>
