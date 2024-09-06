<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
    <div v-for="video in videos" :key="video.id" class="custom-card rounded-lg shadow-md overflow-hidden relative bg-white dark:bg-gray-800">
      <div class="relative">
        <img :src="getFullUrl(video.thumbnailUrl)" alt="Video thumbnail" class="w-full h-40 object-cover">
        <div class="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-50 text-white text-xs px-2 py-1">
          {{ formatDuration(video.duration) }}
        </div>
        <div v-if="isCompleted(video)" class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Completed
        </div>
        <button @click="$emit('open-video-modal', video)" class="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-2 line-clamp-2">{{ video.title }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-3">{{ video.transcript }}</p>
        <div class="flex flex-wrap mb-2">
          <span v-for="tag in video.tags.slice(0, 4)" :key="tag" class="tag mr-1 mb-1">{{ tag }}</span>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <div class="bg-blue-500 h-1" :style="{ width: `${getProgressPercentage(video)}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  tags: string[];
  transcript: string;
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
    }
  },
  emits: ['open-video-modal'],
  setup(props) {
    const getFullUrl = (url: string) => {
      if (url.startsWith('http')) {
        return url;
      }
      return `${props.baseUrl}${url}`;
    };

    const formatDuration = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = (video: Video) => {
      if (!video.currentTime || !video.duration) return 0;
      return (video.currentTime / video.duration) * 100;
    };

    const isCompleted = (video: Video) => {
      if (!video.currentTime || !video.duration) return false;
      return (video.currentTime / video.duration) >= 0.9;
    };

    return {
      getFullUrl,
      formatDuration,
      getProgressPercentage,
      isCompleted
    };
  }
});
</script>

<style scoped>
.custom-card {
  width: calc(100% - 1rem);
  max-width: 280px;
  margin: 0 auto;
  height: 22rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

.tag {
  background-color: #3b82f6;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}
</style>