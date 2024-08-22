<template>
  <div class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" @click.self="closeModal">
    <div class="w-full h-full max-w-7xl mx-auto p-8 flex flex-col">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-white">{{ videoTitle }}</h2>
        <button @click="closeModal" class="text-white hover:text-gray-300" aria-label="Chiudi video">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="flex-grow flex flex-col">
        <div class="w-full mb-8 border-4 border-gray-700 rounded-lg overflow-hidden" style="height: 60vh;">
          <video :src="videoUrl" controls class="w-full h-full object-contain bg-black"></video>
        </div>
        <div class="flex-grow overflow-hidden">
          <h3 class="text-2xl font-semibold mb-4 text-white">Transcript:</h3>
          <div class="bg-gray-800 rounded-lg p-4 h-full overflow-y-auto">
            <p class="text-gray-300 text-lg whitespace-pre-wrap">{{ transcript }}</p>
          </div>
        </div>
      </div>
    </div>
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
    },
    videoTitle: {
      type: String,
      required: true
    },
    transcript: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const closeModal = () => {
      emit('close');
    };

    return {
      closeModal
    };
  }
});
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) rgba(0, 0, 0, 0);
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
</style>