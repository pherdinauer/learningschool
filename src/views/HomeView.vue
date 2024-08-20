<template>
  <div class="home">
    <h1>Video Tutorial</h1>
    <input 
      v-model="searchTerm" 
      @input="searchVideos" 
      type="text" 
      class="search-bar" 
      placeholder="Cerca nei video..."
    >
    <div class="video-grid">
      <div v-for="video in filteredVideos" :key="video.id" class="video-item" @click="selectVideo(video)">
        <img :src="getFullUrl(video.thumbnailUrl)" :alt="video.title" class="video-thumbnail">
        <h3 class="video-title">{{ video.title }}</h3>
        <p class="video-duration">Durata: {{ video.duration }}</p>
      </div>
    </div>
    <router-link to="/login" class="admin-link">Admin Login</router-link>

    <!-- Modal per il video player -->
    <div v-if="selectedVideo" class="modal" @click="closeVideo">
      <div class="modal-content" @click.stop>
        <h2>{{ selectedVideo.title }}</h2>
        <div class="video-wrapper">
          <video :src="getFullUrl(selectedVideo.videoUrl)" controls class="video-player" autoplay></video>
        </div>
        <div class="transcript-container">
          <h3>Transcript:</h3>
          <p class="video-transcript">{{ selectedVideo.transcript }}</p>
        </div>
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
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
  transcript: string;
}

export default defineComponent({
  name: 'HomeView',
  setup() {
    const videos = ref<Video[]>([]);
    const searchTerm = ref('');
    const selectedVideo = ref<Video | null>(null);

    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/videos');
        videos.value = response.data;
      } catch (error) {
        console.error('Errore nel caricamento dei video:', error);
      }
    };

    onMounted(fetchVideos);

    const filteredVideos = computed(() => {
      const term = searchTerm.value.toLowerCase();
      return videos.value.filter(video => 
        video.title.toLowerCase().includes(term) || 
        video.transcript.toLowerCase().includes(term)
      );
    });

    const searchVideos = () => {
      selectedVideo.value = null;
    };

    const selectVideo = (video: Video) => {
      selectedVideo.value = video;
    };

    const closeVideo = () => {
      selectedVideo.value = null;
    };

    const getFullUrl = (path: string) => {
      return `http://localhost:3000${path}`;
    };

    return {
      videos,
      searchTerm,
      filteredVideos,
      selectedVideo,
      searchVideos,
      selectVideo,
      closeVideo,
      getFullUrl
    };
  }
});
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1, h2, h3 {
  color: var(--secondary-color);
  text-align: center;
}

.search-bar {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 20px;
  border: 1px solid var(--secondary-color);
  border-radius: 4px;
  background-color: var(--dark-color);
  color: var(--light-color);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.video-item {
  background: var(--primary-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.video-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
}

.video-thumbnail {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.video-title {
  padding: 10px;
  margin: 0;
  font-size: 18px;
  color: var(--light-color);
}

.video-duration {
  padding: 0 10px 10px;
  margin: 0;
  color: var(--secondary-color);
}

.admin-link {
  display: block;
  text-align: center;
  margin-top: 20px;
  color: var(--secondary-color);
  text-decoration: none;
}

.admin-link:hover {
  text-decoration: underline;
}

/* Stili per il modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--primary-color);
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.video-wrapper {
  width: 100%;
  margin-bottom: 20px;
}

.video-player {
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: black;
}

.transcript-container {
  margin-top: 20px;
}

.video-transcript {
  margin-top: 10px;
  padding: 15px;
  background-color: var(--dark-color);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.6;
  color: var(--light-color);
}
</style>