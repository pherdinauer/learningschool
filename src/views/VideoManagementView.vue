<template>
  <div v-if="isAdminUser" class="container mx-auto px-4">
    <h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Gestione Video</h1>
    <div v-if="loading" class="text-center">
      <p class="text-gray-600 dark:text-gray-400">Caricamento in corso...</p>
    </div>
    <div v-else-if="videos.length === 0" class="text-center">
      <p class="text-gray-600 dark:text-gray-400">Nessun video trovato.</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="video in videos" :key="video.id" class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <img :src="getFullUrl(video.thumbnailUrl)" :alt="video.title" class="w-full h-48 object-cover cursor-pointer" @click="playVideo(video)">
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{{ video.title }}</h2>
          <p class="text-gray-600 dark:text-gray-300 mb-4">Durata: {{ formatDuration(video.duration) }}</p>
          <div class="flex space-x-2">
            <button @click="editVideo(video)" class="font-bold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-300 py-2 px-4 shadow-md">
              Modifica
            </button>
            <button @click="deleteVideo(video.id)" class="font-bold bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-300 py-2 px-4 shadow-md">
              Elimina
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal per la modifica del video -->
    <div v-if="editingVideo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-lg w-full">
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Modifica Video</h2>
        <input v-model="editingVideo.title" class="w-full mb-4 p-2 border rounded dark:bg-gray-800 dark:text-white" placeholder="Titolo">
        <textarea v-model="editingVideo.transcript" class="w-full mb-4 p-2 border rounded dark:bg-gray-800 dark:text-white" placeholder="Trascrizione" rows="4"></textarea>
        <div class="mb-4">
          <input v-model="newTag" @keyup.enter="addTag" class="w-full p-2 border rounded dark:bg-gray-800 dark:text-white" placeholder="Aggiungi tag">
        </div>
        <div class="flex flex-wrap mb-4">
          <span v-for="(tag, index) in editingVideo.tags" :key="index" class="bg-blue-500 text-white text-xs py-1 px-2 rounded mr-2 mb-2 shadow-sm">
            {{ tag }}
            <button @click="removeTag(index)" class="ml-1 text-xs font-bold hover:text-red-500 transition-colors duration-300">&times;</button>
          </span>
        </div>
        <div class="flex justify-end">
          <button @click="cancelEdit" class="font-bold bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-300 py-2 px-4 shadow-md mr-2">
            Annulla
          </button>
          <button @click="saveEdit" class="font-bold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-300 py-2 px-4 shadow-md">
            Salva
          </button>
        </div>
      </div>
    </div>

    <!-- Modal per la riproduzione del video -->
    <div v-if="selectedVideo" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg w-full max-w-4xl">
        <h2 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{{ selectedVideo.title }}</h2>
        <video
          ref="videoRef"
          :src="getFullUrl(selectedVideo.videoUrl)"
          @timeupdate="updateVideoTime"
          @ended="onVideoEnded"
          class="w-full mb-4"
          controls
        ></video>
        <button @click="closeVideoModal" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
          Chiudi
        </button>
      </div>
    </div>
  </div>
  <div v-else class="container mx-auto px-4 text-center">
    <h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Accesso Negato</h1>
    <p class="text-gray-700 dark:text-gray-300">Non hai i permessi necessari per accedere a questa pagina.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

interface Video {
  id: string;
  title: string;
  duration: number;
  transcript: string;
  videoUrl: string;
  thumbnailUrl: string;
  tags: string[];
  currentTime?: number;
}

export default defineComponent({
  name: 'VideoManagementView',
  setup() {
    const router = useRouter();
    const videos = ref<Video[]>([]);
    const loading = ref(true);
    const editingVideo = ref<Video | null>(null);
    const newTag = ref('');
    const selectedVideo = ref<Video | null>(null);
    const videoRef = ref<HTMLVideoElement | null>(null);
    const isPlaying = ref(false);
    const baseUrl = 'http://localhost:3000';

    const isAdminUser = computed(() => {
      return localStorage.getItem('userRole') === 'admin';
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

    onMounted(fetchVideos);

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
      onVideoEnded
    };
  }
});
</script>

<style scoped>
/* Nessuno stile necessario qui, tutto è gestito dalle classi Tailwind */
</style>