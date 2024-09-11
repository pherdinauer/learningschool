<template>
  <div class="container mx-auto px-4">
    <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Playlist</h1>
    <Playlist />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Playlist from '@/components/Playlist.vue';

export default defineComponent({
  name: 'PlaylistView',
  components: {
    Playlist,
  },
});
</script>
