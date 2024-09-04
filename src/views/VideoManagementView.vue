<template>
  <div v-if="isAdminUser" class="container mx-auto px-4">
    <h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Gestione Video</h1>
    <div v-if="loading" class="text-center">
      <p class="text-gray-600 dark:text-gray-400">Caricamento video...</p>
    </div>
    <div v-else-if="videos.length === 0" class="text-center">
      <p class="text-gray-600 dark:text-gray-400">Nessun video trovato.</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="video in videos" :key="video.id" class="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
        <img :src="getFullUrl(video.thumbnailUrl)" :alt="video.title" class="w-full h-48 object-cover cursor-pointer" @click="playVideo(video)">
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{{ video.title }}</h2>
          <p class="text-gray-600 dark:text-gray-300 mb-4">Durata: {{ formatDuration(video.duration) }}</p>
          <div class="flex space-x-2">
            <button @click="editVideo(video)" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Modifica
            </button>
            <button @click="deleteVideo(video.id)" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
              Elimina
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal per la riproduzione del video -->
    <div v-if="selectedVideo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeVideoModal">
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg w-3/4 h-3/4 flex flex-col">
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{{ selectedVideo.title }}</h2>
        <div class="video-player mb-4 flex-grow">
          <video
            ref="videoRef"
            :src="getFullUrl(selectedVideo.videoUrl)"
            @timeupdate="updateVideoTime"
            @ended="onVideoEnded"
            class="w-full h-full object-contain"
            controls
          ></video>
        </div>
        <div class="transcript-container mb-4 h-1/4 overflow-y-auto">
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Transcript</h3>
          <p class="text-gray-700 dark:text-gray-300">{{ selectedVideo.transcript }}</p>
        </div>
        <div class="flex justify-end">
          <button @click="closeVideoModal" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Modal per la modifica del video -->
    <div v-if="editingVideo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-3xl w-full">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Modifica Video</h2>
        <div class="space-y-4">
          <div>
            <label for="videoTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Titolo</label>
            <input
              id="videoTitle"
              v-model="editingVideo.title"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
              placeholder="Titolo del video"
            >
          </div>
          <div class="flex space-x-4">
            <div class="flex-grow">
              <label for="videoDuration" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Durata (secondi)</label>
              <input
                id="videoDuration"
                v-model="editingVideo.duration"
                type="number"
                min="0"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                placeholder="Durata in secondi"
              >
            </div>
            <div class="flex-grow">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Durata formattata</label>
              <input
                :value="formatDuration(editingVideo.duration)"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2"
                readonly
              >
            </div>
          </div>
          <div>
            <label for="videoTranscript" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Trascrizione</label>
            <textarea
              id="videoTranscript"
              v-model="editingVideo.transcript"
              rows="4"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
              placeholder="Trascrizione del video"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tag</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span
                v-for="(tag, index) in editingVideo.tags"
                :key="index"
                class="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
              >
                {{ tag }}
                <button @click="removeTag(index)" class="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">
                  &times;
                </button>
              </span>
            </div>
            <div class="flex items-center space-x-2 mt-2">
              <input
                v-model="newTag"
                @keyup.enter="addTag"
                class="flex-grow rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                placeholder="Aggiungi un nuovo tag"
              >
              <button
                @click="addTag"
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <button @click="cancelEdit" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            Annulla
          </button>
          <button @click="saveEdit" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            Salva
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="container mx-auto px-4 text-center">
    <h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Accesso Negato</h1>
    <p class="text-gray-700 dark:text-gray-300">Non hai i permessi necessari per accedere a questa pagina.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

interface Video {
  id: string;
  title: string;
  duration: number;
  thumbnailUrl: string;
  videoUrl: string;
  transcript: string;
  tags: string[];
  currentTime?: number;
}

export default defineComponent({
  name: 'VideoManagementView',
  setup() {
    const router = useRouter();
    const videos = ref<Video[]>([]);
    const loading = ref(true);
    const selectedVideo = ref<Video | null>(null);
    const editingVideo = ref<Video | null>(null);
    const newTag = ref('');
    const baseUrl = 'http://localhost:3000';
    const isPlaying = ref(true);
    const videoRef = ref<HTMLVideoElement | null>(null);

    const isAdminUser = computed(() => {
      return localStorage.getItem('userRole') === 'admin';
    });

    onMounted(() => {
      if (!isAdminUser.value) {
        // Opzionale: reindirizza l'utente alla home page se non è un amministratore
        // router.push('/');
        return;
      }
      fetchVideos();
      window.addEventListener('keydown', handleKeyPress);
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyPress);
    });

    const fetchVideos = async () => {
      if (!isAdminUser.value) return;
      
      try {
        const response = await axios.get(`${baseUrl}/videos`);
        videos.value = response.data;
        loading.value = false;
      } catch (error) {
        console.error('Error fetching videos:', error);
        loading.value = false;
      }
    };

    const deleteVideo = async (videoId: string) => {
      if (confirm('Sei sicuro di voler eliminare questo video?')) {
        try {
          await axios.delete(`${baseUrl}/videos/${videoId}`);
          videos.value = videos.value.filter(video => video.id !== videoId);
        } catch (error) {
          console.error('Error deleting video:', error);
          alert('Impossibile eliminare il video. Riprova più tardi.');
        }
      }
    };

    const editVideo = (video: Video) => {
      editingVideo.value = { ...video, tags: [...video.tags] };
    };

    const cancelEdit = () => {
      editingVideo.value = null;
      newTag.value = '';
    };

    const saveEdit = async () => {
      if (!editingVideo.value) return;

      try {
        const response = await axios.put(`${baseUrl}/videos/${editingVideo.value.id}`, {
          title: editingVideo.value.title,
          transcript: editingVideo.value.transcript,
          tags: editingVideo.value.tags
        });
        
        const index = videos.value.findIndex(v => v.id === editingVideo.value!.id);
        if (index !== -1) {
          videos.value[index] = response.data;
        }
        
        editingVideo.value = null;
        newTag.value = '';
      } catch (error) {
        console.error('Error updating video:', error);
        alert('Impossibile aggiornare il video. Riprova più tardi.');
      }
    };

    const addTag = () => {
      if (editingVideo.value && newTag.value.trim()) {
        editingVideo.value.tags.push(newTag.value.trim());
        newTag.value = '';
      }
    };

    const removeTag = (index: number) => {
      if (editingVideo.value) {
        editingVideo.value.tags.splice(index, 1);
      }
    };

    const formatDuration = (duration: number) => {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getFullUrl = (url: string) => {
      if (url.startsWith('http')) {
        return url;
      }
      return `${baseUrl}${url}`;
    };

    const updateVideoTime = (event: Event) => {
      const video = event.target as HTMLVideoElement;
      if (selectedVideo.value) {
        selectedVideo.value.currentTime = video.currentTime;
      }
    };

    const onVideoEnded = () => {
      isPlaying.value = false;
    };

    const playVideo = (video: Video) => {
      selectedVideo.value = { ...video, currentTime: video.currentTime || 0 };
      isPlaying.value = true;
    };

    const closeVideoModal = () => {
      selectedVideo.value = null;
      isPlaying.value = false;
    };

    const togglePlayPause = () => {
      if (videoRef.value) {
        if (videoRef.value.paused) {
          videoRef.value.play();
          isPlaying.value = true;
        } else {
          videoRef.value.pause();
          isPlaying.value = false;
        }
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && selectedVideo.value) {
        event.preventDefault();
        togglePlayPause();
      }
    };

    return {
      videos,
      loading,
      deleteVideo,
      formatDuration,
      selectedVideo,
      playVideo,
      closeVideoModal,
      updateVideoTime,
      getFullUrl,
      editVideo,
      editingVideo,
      cancelEdit,
      saveEdit,
      newTag,
      addTag,
      removeTag,
      isAdminUser,
      isPlaying,
      videoRef,
      togglePlayPause,
      onVideoEnded
    };
  }
});
</script>