<template>
  <div class="dark:bg-gray-800">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="video in filteredVideos" :key="video.id" class="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
        <img :src="getFullUrl(video.thumbnailUrl)" :alt="video.title" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="font-bold text-xl mb-2 dark:text-white">{{ video.title }}</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm mb-2">Duration: {{ formatDuration(video.duration) }}</p>
          <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">{{ video.transcript.substring(0, 100) }}...</p>
          <button @click="openVideoModal(video)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Play
          </button>
        </div>
      </div>
    </div>

    <!-- Video Modal -->
    <div v-if="selectedVideo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-4xl w-full">
        <h2 class="text-2xl font-bold mb-4 dark:text-white">{{ selectedVideo.title }}</h2>
        <video :src="getFullUrl(selectedVideo.videoUrl)" controls class="w-full mb-4"></video>
        <h3 class="text-xl font-semibold mb-2 dark:text-white">Transcript:</h3>
        <p class="text-gray-700 dark:text-gray-300">{{ selectedVideo.transcript }}</p>
        <button @click="closeVideoModal" class="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Close
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import axios from 'axios';

interface Video {
  id: number;
  title: string;
  duration: number;
  transcript: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export default defineComponent({
  name: 'HomeView',
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const videos = ref<Video[]>([]);
    const selectedVideo = ref<Video | null>(null);

    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/videos');
        videos.value = response.data;
        console.log('Fetched videos:', videos.value);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    onMounted(fetchVideos);

    const filteredVideos = computed(() => {
      return videos.value.filter(video =>
        video.title.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
        video.transcript.toLowerCase().includes(props.searchQuery.toLowerCase())
      );
    });

    const getFullUrl = (path: string) => {
      return `http://localhost:3000${path}`;
    };

    const openVideoModal = (video: Video) => {
      selectedVideo.value = video;
    };

    const closeVideoModal = () => {
      selectedVideo.value = null;
    };

    const formatDuration = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return { 
      filteredVideos, 
      selectedVideo, 
      openVideoModal, 
      closeVideoModal,
      getFullUrl,
      formatDuration
    };
  }
});
</script>