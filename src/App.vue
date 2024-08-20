<template>
  <div id="app">
    <Toolbar />
    <main class="pt-16">
      <router-view></router-view>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Toolbar from '@/components/Toolbar.vue';

export default defineComponent({
  name: 'App',
  components: {
    Toolbar
  }
});
</script>

<style>
:root {
  --primary-color: #215D85;
  --secondary-color: #3B98D2;
  --dark-color: #424242;
  --light-color: #CFD8DC;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: var(--dark-color);
  color: var(--light-color);
  margin: 0;
  padding: 0;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

main {
  padding-top: 4rem; /* Equivalente a pt-16 in Tailwind, assumendo che 1rem = 4px */
}
</style>