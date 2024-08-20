<template>
    <div class="home">
      <input 
        v-model="searchTerm" 
        @input="searchVideos" 
        type="text" 
        class="search-bar" 
        placeholder="Cerca nei video..."
      >
      <div class="video-grid">
        <div v-for="video in filteredVideos" :key="video.id" class="video-item" @click="openVideoModal(video)">
          <img :src="video.thumbnail" :alt="video.title" class="video-thumbnail">
          <h3 class="video-title">{{ video.title }}</h3>
          <p class="video-duration">Durata: {{ video.duration }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  
  interface Video {
    id: number;
    title: string;
    duration: string;
    thumbnail: string;
    transcript: string;
  }
  
  export default defineComponent({
    name: 'HomeView',
    setup() {
        const videos = ref<Video[]>([
  {
    id: 1,
    title: "Come accedere all'applicativo",
    duration: "1:30",
    thumbnail: "/thumbnails/thumbnail1.jpg",
    transcript: "In questo video vedremo come accedere all'applicativo web usando le vostre credenziali...",
    videoUrl: "/videos/video1.mp4"
  },
  {
    id: 2,
    title: "Navigazione del menu principale",
    duration: "2:15",
    thumbnail: "/thumbnails/thumbnail2.jpg",
    transcript: "Esploreremo le diverse sezioni del menu principale e come navigare efficacemente tra di esse...",
    videoUrl: "/videos/video2.mp4"
  },
  // Aggiungi altri video qui...
]);
  
const searchTerm = ref('');
    const selectedVideo = ref<Video | null>(null);

    const filteredVideos = computed(() => {
      const term = searchTerm.value.toLowerCase();
      return videos.value.filter(video => 
        video.title.toLowerCase().includes(term) || 
        video.transcript.toLowerCase().includes(term)
      );
    });

    const selectVideo = (video: Video) => {
      selectedVideo.value = video;
    };

    return {
      searchTerm,
      filteredVideos,
      selectedVideo,
      selectVideo
    };
  }
});
  </script>
  
  <style scoped>
  .search-bar {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    margin-bottom: 20px;
  }
  
  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .video-item {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: transform 0.3s ease;
  }
  
  .video-item:hover {
    transform: translateY(-5px);
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
  }
  
  .video-duration {
    padding: 0 10px 10px;
    margin: 0;
    color: #666;
  }
  </style>