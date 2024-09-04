<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
    <div v-for="video in videos" :key="video.id" class="custom-card rounded-lg shadow-md overflow-hidden relative bg-white dark:bg-gray-800 w-80">
      <img 
        :src="getFullUrl(video.thumbnailUrl)" 
        :alt="video.title"
        class="w-full h-48 object-cover cursor-pointer"
        @click="openVideoModal(video)"
        @error="handleImageError(video)"
      >
      <!-- Barra di avanzamento -->
      <div class="absolute bottom-0 left-0 w-full h-1 bg-gray-300">
        <div class="h-full bg-primary" :style="{ width: `${calculateProgress(video)}%` }"></div>
      </div>
      <div class="p-4 flex flex-col h-64">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-lg text-secondary dark:text-tertiary line-clamp-2 break-words flex-grow">{{ video.title || '\u00A0' }}</h3>
          <button @click.stop="toggleFavorite(video)" class="text-yellow-500 hover:text-yellow-600 ml-2 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :fill="isFavorite(video) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784-.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>
        <p class="text-gray-600 dark:text-gray-300 text-sm mb-2">Duration: {{ formatDuration(video.duration) }}</p>
        <p class="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-4 h-24 break-words">{{ video.transcript || '\u00A0' }}</p>
        <div class="flex flex-wrap mb-2 h-8 overflow-hidden">
          <span v-for="(tag, index) in video.tags.slice(0, 4)" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
        <div class="flex items-center justify-between mt-auto">
          <button @click="openVideoModal(video)" class="btn btn-primary btn-sm">
            Play
          </button>
          <div v-if="isVideoCompleted(video)" class="flex items-center text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-medium">Completed</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: number;
  tags: string[];
  transcript: string;
  videoUrl: string;
  currentTime?: number;
}

export default defineComponent({
  name: 'Cards',
  props: {
    videos: {
      type: Array as PropType<Video[]>,
      required: true
    },
    baseUrl: {
      type: String,
      required: true
    },
    favorites: {
      type: Array as PropType<string[]>,
      required: true
    }
  },
  emits: ['open-video-modal', 'toggle-favorite'],
  setup(props, { emit }) {
    const getFullUrl = (url: string) => {
      if (url.startsWith('http')) {
        return url;
      }
      return `${props.baseUrl}${url}`;
    };

    const handleImageError = (video: Video) => {
      console.log(`Thumbnail not available for video ${video.id}, using placeholder...`);
      video.thumbnailUrl = '/path/to/placeholder-image.jpg';
    };

    const formatDuration = (duration: number) => {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const openVideoModal = (video: Video) => {
      emit('open-video-modal', video);
    };

    const toggleFavorite = (video: Video) => {
      emit('toggle-favorite', video);
    };

    const isFavorite = (video: Video) => {
      return props.favorites.includes(video.id);
    };

    const calculateProgress = (video: Video) => {
      if (!video.duration || !video.currentTime) return 0;
      return (video.currentTime / video.duration) * 100;
    };

    const isVideoCompleted = (video: Video) => {
      const progress = calculateProgress(video);
      return progress >= 90;
    };

    return {
      getFullUrl,
      handleImageError,
      formatDuration,
      openVideoModal,
      toggleFavorite,
      isFavorite,
      calculateProgress,
      isVideoCompleted
    };
  }
});
</script>

<style scoped>
.custom-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  height: 28rem; /* 448px */
}

.dark .custom-card {
  background-color: #1a202c;
  border-color: #4a5568;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  line-clamp: 4;
  overflow: hidden;
}

.break-words {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.btn-sm {
  padding-top: 0.25rem;    /* py-1 */
  padding-bottom: 0.25rem; /* py-1 */
  padding-left: 0.5rem;    /* px-2 */
  padding-right: 0.5rem;   /* px-2 */
  font-size: 0.875rem;     /* text-sm */
}

.btn-primary {
  /* Definisci qui gli stili di base per btn-primary */
  background-color: var(--color-primary);
  color: white;
  font-weight: bold;
  border-radius: 0.25rem;
  transition-property: color, background-color, border-color;
  transition-duration: 300ms;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn {
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: background-color 300ms, opacity 300ms;
  cursor: pointer;
}

.btn-primary {
  background-color: var(--color-primary, #3490dc);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark, #2779bd);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>