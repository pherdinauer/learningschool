<template>
  <div class="flex custom-scrollbar">
    <div class="w-full overflow-y-auto h-screen pb-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <div v-for="video in filteredVideos" :key="video.id" class="custom-card rounded-lg shadow-md overflow-hidden relative">
          <img 
            :src="video.thumbnailUrl ? getThumbnailUrl(video) : placeholderImage" 
            :alt="video.title"
            class="w-full h-48 object-cover"
            @error="handleImageError(video)"
          >
          <!-- Barra di avanzamento -->
          <div class="absolute bottom-0 left-0 w-full h-1 bg-gray-600">
            <div class="h-full bg-red-500" :style="{ width: `${calculateProgress(video)}%` }"></div>
          </div>
          <div class="p-4">
            <div class="flex justify-between items-start">
              <h3 class="font-bold text-xl mb-2 text-white">{{ video.title }}</h3>
              <button @click.stop="toggleFavorite(video)" class="text-yellow-500 hover:text-yellow-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :fill="isFavorite(video) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784-.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>
            <p class="text-gray-300 text-sm mb-2">Duration: {{ formatDuration(video.duration) }}</p>
            <div class="flex flex-wrap mb-2">
              <span v-for="tag in video.tags" :key="tag" class="bg-gray-600 text-gray-200 text-xs px-2 py-1 rounded mr-1 mb-1">
                {{ tag }}
              </span>
            </div>
            <p class="text-gray-300 text-sm mb-4">{{ video.transcript.substring(0, 100) }}...</p>
            <button @click="openVideoModal(video)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Play
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Modal -->
    <VideoPlayer
      v-if="selectedVideo"
      :videoUrl="getFullUrl(selectedVideo.videoUrl)"
      :videoTitle="selectedVideo.title"
      :transcript="selectedVideo.transcript"
      :currentTime="selectedVideo.currentTime || 0"
      @close="closeVideoModal"
      @timeUpdate="updateVideoTime"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import eventBus from '@/eventBus';
import VideoPlayer from './VideoPlayer.vue';

interface Video {
  id: number;
  title: string;
  duration: number;
  transcript: string;
  videoUrl: string;
  thumbnailUrl: string;
  preview?: string;
  currentTime?: number;
  tags: string[];
  thumbnailVersion: number;
}

export default defineComponent({
  name: 'HomeView',
  components: {
    VideoPlayer
  },
  props: {
    searchQuery: {
      type: String,
      default: ''
    },
    selectedTag: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const videos = ref<Video[]>([]);
    const selectedVideo = ref<Video | null>(null);
    const favorites = ref<number[]>(JSON.parse(localStorage.getItem('favorites') || '[]'));
    const placeholderImage = ref('/path/to/placeholder-image.jpg'); // Sostituisci con il percorso della tua immagine placeholder
    const baseUrl = 'http://localhost:3000';

    const fetchVideos = async () => {
      try {
        console.log('Fetching videos...');
        const response = await axios.get(`${baseUrl}/videos`);
        videos.value = response.data.map((video: Video) => ({
          ...video,
          thumbnailUrl: `${baseUrl}${video.thumbnailUrl}`, // Aggiungi il baseUrl all'inizio dell'URL della thumbnail
          thumbnailVersion: Date.now() // Aggiungi un timestamp per forzare l'aggiornamento
        }));
        console.log(`Fetched ${videos.value.length} videos`);
        fetchPreviews();
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    const fetchPreviews = async () => {
      console.log('Fetching previews...');
      for (const video of videos.value) {
        try {
          console.log(`Fetching preview for video ${video.id}...`);
          const response = await axios.get(`${baseUrl}/preview/${video.id}`);
          video.preview = response.data.preview;
          console.log(`Preview fetched for video ${video.id}`);
        } catch (error) {
          console.warn(`Impossibile caricare l'anteprima per il video ${video.id}:`, error);
          video.preview = 'Anteprima non disponibile';
        }
      }
      console.log('All previews fetched');
    };

    const handleVideoUploaded = () => {
      console.log('Video uploaded, refreshing videos...');
      fetchVideos();
    };

    const getThumbnailUrl = (video: Video) => {
      return `${video.thumbnailUrl}?v=${video.thumbnailVersion}`;
    };

    const handleImageError = async (video: Video) => {
      console.log(`Thumbnail not available for video ${video.id}, retrying...`);
      let retries = 5;
      while (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Attendi 2 secondi
        try {
          const response = await axios.head(video.thumbnailUrl);
          if (response.status === 200) {
            console.log(`Thumbnail for video ${video.id} is now available`);
            video.thumbnailVersion = Date.now(); // Forza l'aggiornamento dell'immagine
            return;
          }
        } catch (error) {
          console.log(`Retry failed for video ${video.id}, attempts left: ${retries}`);
        }
        retries--;
      }
      console.log(`Failed to load thumbnail for video ${video.id} after multiple attempts`);
    };

    onMounted(() => {
      fetchVideos();
      eventBus.$on('video-uploaded', handleVideoUploaded);
    });

    onUnmounted(() => {
      eventBus.$off('video-uploaded', handleVideoUploaded);
    });

    watch(() => props.searchQuery, () => {
      fetchVideos();
    });

    const filteredVideos = computed(() => {
      return videos.value.filter(video =>
        (props.selectedTag ? video.tags.includes(props.selectedTag) : true) &&
        (video.title.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
         video.transcript.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
         video.tags.some((tag: string) => tag.toLowerCase().includes(props.searchQuery.toLowerCase()))
        )
      );
    });

    const getFullUrl = (path: string) => {
      return `${baseUrl}${path}`;
    };

    const openVideoModal = (video: Video) => {
      console.log('Opening video:', video);
      selectedVideo.value = { ...video, currentTime: video.currentTime || 0 };
    };

    const closeVideoModal = () => {
      console.log('Closing video modal');
      selectedVideo.value = null;
    };

    const formatDuration = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const toggleFavorite = (video: Video) => {
      const index = favorites.value.indexOf(video.id);
      if (index === -1) {
        favorites.value.push(video.id);
      } else {
        favorites.value.splice(index, 1);
      }
      localStorage.setItem('favorites', JSON.stringify(favorites.value));
    };

    const isFavorite = (video: Video) => {
      return favorites.value.includes(video.id);
    };

    const updateVideoTime = (time: number) => {
      console.log('Updating video time:', time);
      if (selectedVideo.value) {
        selectedVideo.value.currentTime = time;
        const index = videos.value.findIndex(v => v.id === selectedVideo.value?.id);
        if (index !== -1) {
          videos.value[index].currentTime = time;
        }
      }
    };

    const calculateProgress = (video: Video) => {
      if (!video.currentTime || !video.duration) return 0;
      return (video.currentTime / video.duration) * 100;
    };

    watch(selectedVideo, (newValue) => {
      console.log('selectedVideo changed:', newValue);
    });

    return { 
      filteredVideos, 
      selectedVideo, 
      openVideoModal, 
      closeVideoModal,
      getFullUrl,
      formatDuration,
      toggleFavorite,
      isFavorite,
      fetchVideos,
      fetchPreviews,
      updateVideoTime,
      calculateProgress,
      placeholderImage,
      getThumbnailUrl,
      handleImageError
    };
  }
});
</script>

<style scoped>
.custom-card {
  background-color: #3e4756;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
  border: transparent;
}

:global(.dark) .custom-scrollbar {
  scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}
</style>