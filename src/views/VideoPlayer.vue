<template>
  <div class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" @click.self="closeModal" @keydown.esc="closeModal" tabindex="0" ref="modalContainer">
    <div class="w-full h-full max-w-7xl mx-auto p-8 flex flex-col bg-gray-100 dark:bg-gray-900 bg-opacity-95 dark:bg-opacity-80 rounded-lg">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-gray-800 dark:text-white">{{ videoTitle }}</h2>
        <button @click="closeModal" class="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white" aria-label="Chiudi video">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="flex-grow flex flex-col">
        <div class="w-full mb-8 border-4 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden" style="height: 60vh;">
          <video 
            ref="videoPlayer"
            :src="videoUrl" 
            @loadedmetadata="onVideoLoaded"
            @timeupdate="onTimeUpdate"
            controls
            class="w-full h-full object-contain bg-black"
          ></video>
        </div>
        <div class="flex-grow overflow-hidden">
          <h3 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Transcript:</h3>
          <div class="bg-gray-200 dark:bg-gray-800 rounded-lg p-4 h-full overflow-y-auto">
            <p class="text-gray-700 dark:text-gray-300 text-lg whitespace-pre-wrap">{{ transcript }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue';

export default defineComponent({
  name: 'VideoPlayer',
  props: {
    videoUrl: {
      type: String,
      required: true
    },
    videoTitle: {
      type: String,
      required: true
    },
    transcript: {
      type: String,
      required: true
    },
    currentTime: {
      type: Number,
      default: 0
    }
  },
  emits: ['close', 'timeUpdate'],
  setup(props, { emit }) {
    const videoPlayer = ref<HTMLVideoElement | null>(null);
    const modalContainer = ref<HTMLElement | null>(null);
    const lastUpdateTime = ref(0);

    const onVideoLoaded = () => {
      if (videoPlayer.value) {
        videoPlayer.value.currentTime = props.currentTime;
        videoPlayer.value.play().catch(error => {
          console.error('Autoplay was prevented:', error);
        });
      }
    };

    const onTimeUpdate = () => {
      if (videoPlayer.value) {
        const currentTime = videoPlayer.value.currentTime;
        if (currentTime - lastUpdateTime.value >= 1) {
          emit('timeUpdate', currentTime);
          lastUpdateTime.value = currentTime;
        }
      }
    };

    const closeModal = () => {
      emit('close');
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    onMounted(() => {
      if (videoPlayer.value) {
        videoPlayer.value.currentTime = props.currentTime;
      }
      if (modalContainer.value) {
        modalContainer.value.focus();
      }
      document.addEventListener('keydown', handleKeyDown);
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyDown);
    });

    watch(() => props.currentTime, (newTime) => {
      if (videoPlayer.value && Math.abs(videoPlayer.value.currentTime - newTime) > 1) {
        videoPlayer.value.currentTime = newTime;
      }
    });

    return {
      videoPlayer,
      modalContainer,
      onVideoLoaded,
      onTimeUpdate,
      closeModal
    };
  }
});
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb);
  border-radius: 3px;
}

:root {
  --scrollbar-thumb: #9ca3af;
  --scrollbar-track: #e5e7eb;
}

.dark {
  --scrollbar-thumb: #4b5563;
  --scrollbar-track: #1f2937;
}
</style>