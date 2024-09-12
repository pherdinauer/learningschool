<template>
  <div class="flex flex-col custom-scrollbar">
    <!-- Tag filter bar -->
    <div class="tag-filter-bar py-4 px-4 overflow-x-auto">
      <div class="flex space-x-2">
        <button
          v-for="tag in uniqueTags"
          :key="tag"
          @click="toggleTagFilter(tag)"
          :class="[
            'px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200',
            selectedTag === tag
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <div class="w-full overflow-y-auto h-screen pb-20">
      <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Playlist</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <div v-for="playlist in playlists" :key="playlist.id" class="custom-card rounded-lg shadow-md overflow-hidden relative bg-white dark:bg-gray-800 cursor-pointer" @click="openPlaylistModal(playlist)">
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-2 line-clamp-2">{{ playlist.name }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ playlist.videos.length }} video</p>
          </div>
        </div>
      </div>

      <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Video</h2>
      <Cards 
        :videos="filteredVideos" 
        :baseUrl="baseUrl"
        @open-video-modal="openVideoModal"
        @favorites-updated="updateFavorites"
      />
    </div>

    <!-- Video Modal -->
    <VideoPlayer
      v-if="selectedVideo"
      :videoUrl="getFullUrl(selectedVideo?.videoUrl)"
      :videoTitle="selectedVideo?.title"
      :transcript="selectedVideo?.transcript"
      :currentTime="selectedVideo?.currentTime || 0"
      @close="closeVideoModal"
      @timeUpdate="updateVideoTime"
    />

    <!-- Playlist Modal -->
    <PlaylistModal
      v-if="selectedPlaylist"
      :playlist="selectedPlaylist"
      :videos="playlistVideos"
      :baseUrl="baseUrl"
      @close="closePlaylistModal"
      @open-video-modal="openVideoModal"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import VideoPlayer from './VideoPlayer.vue';
import Cards from '@/components/Cards.vue';
import PlaylistModal from '@/components/PlaylistModal.vue';
import axios from 'axios';

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

interface Playlist {
  id: string;
  name: string;
  videos: string[];
}

export default defineComponent({
  name: 'HomeView',
  components: {
    VideoPlayer,
    Cards,
    PlaylistModal,
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
    const favorites = ref<string[]>(JSON.parse(localStorage.getItem('favorites') || '[]'));
    const baseUrl = 'http://localhost:3000';
    const playlists = ref<Playlist[]>([]);
    const selectedPlaylist = ref<Playlist | null>(null);
    const playlistVideos = ref<Video[]>([]);

    const fetchVideos = async () => {
      try {
        const response = await fetch(`${baseUrl}/videos`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Video[] = await response.json();
        videos.value = data;
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    const fetchPlaylists = async () => {
      try {
        const response = await axios.get(`${baseUrl}/playlists`);
        playlists.value = response.data;
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    const filteredVideos = computed(() => {
      return videos.value.filter(video =>
        (!selectedTag.value || video.tags.includes(selectedTag.value)) &&
        (video.transcript.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
         video.title.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
         video.tags.some(tag => tag.toLowerCase().includes(props.searchQuery.toLowerCase()))
        )
      );
    });

    const toggleFavorite = (video: Video) => {
      const index = favorites.value.indexOf(video.id);
      if (index === -1) {
        favorites.value.push(video.id);
      } else {
        favorites.value.splice(index, 1);
      }
      localStorage.setItem('favorites', JSON.stringify(favorites.value));
    };

    const openVideoModal = (video: Video) => {
      selectedVideo.value = { ...video, currentTime: video.currentTime || 0 };
    };

    const closeVideoModal = () => {
      selectedVideo.value = null;
    };

    const updateVideoTime = (time: number) => {
      if (selectedVideo.value) {
        selectedVideo.value.currentTime = time;
        // Aggiorna anche il video nell'array videos
        const index = videos.value.findIndex(v => v.id === selectedVideo.value!.id);
        if (index !== -1) {
          videos.value[index].currentTime = time;
        }
      }
    };

    const getFullUrl = (url: string) => {
      if (url.startsWith('http')) {
        return url;
      }
      return `${baseUrl}${url}`;
    };

    const openPlaylistModal = async (playlist: Playlist) => {
      selectedPlaylist.value = playlist;
      try {
        const videoPromises = playlist.videos.map(videoId => 
          axios.get(`${baseUrl}/videos/${videoId}`)
        );
        const videoResponses = await Promise.all(videoPromises);
        playlistVideos.value = videoResponses.map(response => response.data);
      } catch (error) {
        console.error('Errore nel recupero dei video della playlist:', error);
        alert('Si è verificato un errore nel caricamento dei video della playlist');
      }
    };

    const closePlaylistModal = () => {
      selectedPlaylist.value = null;
      playlistVideos.value = [];
    };

    const updateFavorites = (newFavorites: string[]) => {
      favorites.value = newFavorites;
    };

    const uniqueTags = computed(() => {
      const allTags = videos.value.flatMap(video => video.tags);
      return ['Tutti', ...new Set(allTags)];
    });

    const selectedTag = ref<string | null>(null);

    const toggleTagFilter = (tag: string) => {
      selectedTag.value = selectedTag.value === tag ? null : tag;
    };

    onMounted(() => {
      fetchVideos();
      fetchPlaylists();
    });

    watch(() => props.searchQuery, fetchVideos);

    return { 
      filteredVideos, 
      selectedVideo, 
      openVideoModal, 
      closeVideoModal,
      getFullUrl,
      toggleFavorite,
      updateVideoTime,
      baseUrl,
      favorites,
      playlists,
      selectedPlaylist,
      playlistVideos,
      openPlaylistModal,
      closePlaylistModal,
      updateFavorites,
      uniqueTags,
      selectedTag,
      toggleTagFilter,
    };
  }
});
</script>

<style scoped>
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

.tag-filter-bar {
  position: sticky;
  top: 64px; /* Regola questo valore in base all'altezza della tua toolbar */
  z-index: 10;
  border-bottom: 1px solid #e5e7eb; /* Aggiunge una sottile linea di separazione */
}

.dark .tag-filter-bar {
  border-bottom-color: #4b5563; /* Colore della linea per la modalità scura */
}

.tag-filter-bar .flex {
  padding-bottom: 0.5rem; /* Aggiunge un po' di spazio sotto i bottoni */
}

.tag-filter-bar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tag-filter-bar::-webkit-scrollbar {
  display: none;
}
</style>