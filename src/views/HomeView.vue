<template>
  <div class="flex">
    <!-- Colonna dei tag -->
    <div class="w-1/4 pr-4">
      <h2 class="text-xl font-bold mb-4 dark:text-white">Tags</h2>
      <div class="space-y-2">
        <button
          v-for="tag in uniqueTags"
          :key="tag"
          @click="filterByTag(tag)"
          class="block w-full text-left px-3 py-2 rounded"
          :class="selectedTag === tag ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Griglia dei video -->
    <div class="w-3/4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="video in filteredVideos" :key="video.id" class="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden relative">
          <img :src="getFullUrl(video.thumbnailUrl)" :alt="video.title" class="w-full h-48 object-cover">
          <div class="p-4">
            <div class="flex justify-between items-start">
              <h3 class="font-bold text-xl mb-2 dark:text-white">{{ video.title }}</h3>
              <button @click.stop="toggleFavorite(video)" class="text-yellow-500 hover:text-yellow-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :fill="isFavorite(video) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784-.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>
            <p class="text-gray-600 dark:text-gray-300 text-sm mb-2">Duration: {{ formatDuration(video.duration) }}</p>
            <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">{{ video.transcript.substring(0, 100) }}...</p>
            <div class="flex flex-wrap mb-2">
              <span v-for="tag in video.tags" :key="tag" class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-2">
                {{ tag }}
              </span>
            </div>
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
      @close="closeVideoModal"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import eventBus from '@/eventBus';
import VideoPlayer from './VideoPlayer.vue'; // Importa VideoPlayer

interface Video {
  id: number;
  title: string;
  duration: number;
  transcript: string;
  videoUrl: string;
  thumbnailUrl: string;
  tags: string[];
  preview?: string;
  currentTime?: number;
}

export default defineComponent({
  name: 'HomeView',
  components: {
    VideoPlayer // Registra il componente
  },
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const videos = ref<Video[]>([]);
    const selectedVideo = ref<Video | null>(null);
    const favorites = ref<number[]>(JSON.parse(localStorage.getItem('favorites') || '[]'));
    const allTags = ref<string[]>([]);
    const selectedTag = ref<string | null>(null);

    const fetchVideos = async (query = '') => {
      try {
        console.log('Fetching videos...');
        const response = await axios.get(`http://localhost:3000/videos?t=${Date.now()}`);
        videos.value = response.data.map((video: Video) => ({
          ...video,
          thumbnailUrl: `${video.thumbnailUrl}?t=${Date.now()}`
        }));
        console.log(`Fetched ${videos.value.length} videos`);
        fetchPreviews();
        fetchTags(); // Fetch tags after fetching videos
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    const fetchPreviews = async () => {
      console.log('Fetching previews...');
      for (const video of videos.value) {
        try {
          console.log(`Fetching preview for video ${video.id}...`);
          const response = await axios.get(`http://localhost:3000/preview/${video.id}`);
          video.preview = response.data.preview;
          console.log(`Preview fetched for video ${video.id}`);
        } catch (error) {
          console.warn(`Impossibile caricare l'anteprima per il video ${video.id}:`, error);
          video.preview = 'Anteprima non disponibile';
        }
      }
      console.log('All previews fetched');
    };

    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:3000/tags');
        allTags.value = response.data;
        console.log('Tags fetched:', allTags.value);
      } catch (error) {
        console.error('Errore nel recupero dei tag:', error);
      }
    };

    const updateAllTags = () => {
      const tagsSet = new Set<string>();
      videos.value.forEach(video => {
        video.tags.forEach(tag => tagsSet.add(tag));
      });
      allTags.value = Array.from(tagsSet);
    };

    const handleVideoUploaded = () => {
      console.log('Video uploaded, refreshing videos...');
      setTimeout(() => {
        fetchVideos();
      }, 2000);
    };

    onMounted(() => {
      fetchVideos();
      eventBus.$on('video-uploaded', handleVideoUploaded);
    });

    onUnmounted(() => {
      eventBus.$off('video-uploaded', handleVideoUploaded);
    });

    watch(() => props.searchQuery, (newQuery) => {
      fetchVideos(newQuery);
    }, { immediate: true });

    watch(() => videos.value, (newVideos) => {
      console.log('Video aggiornati:', newVideos);
    }, { deep: true });

    const filteredVideos = computed(() => {
      return videos.value.filter(video =>
        (video.title.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
        video.transcript.toLowerCase().includes(props.searchQuery.toLowerCase())) &&
        (!selectedTag.value || video.tags.includes(selectedTag.value))
      );
    });

    const getFullUrl = (path: string) => {
      return `http://localhost:3000${path}`;
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

    const filterByTag = (tag: string) => {
      selectedTag.value = selectedTag.value === tag ? null : tag;
    };

    const uniqueTags = computed(() => {
      const allTags = videos.value.flatMap(video => video.tags);
      return [...new Set(allTags)];
    });

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

    return { 
      filteredVideos, 
      selectedVideo, 
      openVideoModal, 
      closeVideoModal,
      getFullUrl,
      formatDuration,
      toggleFavorite,
      isFavorite,
      allTags,
      selectedTag,
      filterByTag,
      fetchVideos,
      fetchPreviews,
      uniqueTags,
      updateVideoTime
    };
  }
});
</script>