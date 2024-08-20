<template>
  <div class="video-player">
    <video :src="videoUrl" controls>
      Il tuo browser non supporta il tag video.
    </video>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VideoPlayer',
  props: {
    videoUrl: {
      type: String,
      required: true
    }
  }
});
</script>

<style scoped>
.video-player {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

video {
  width: 100%;
  height: auto;
}
</style>