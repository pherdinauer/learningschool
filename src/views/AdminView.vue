<template>
  <div class="admin-container">
    <h2>Pannello di Amministrazione</h2>
    <form @submit.prevent="uploadVideo" class="upload-form">
      <div class="form-group">
        <label for="title">Titolo del Video</label>
        <input type="text" id="title" v-model="videoTitle" required>
      </div>
      <div class="form-group">
        <label for="duration">Durata</label>
        <input type="text" id="duration" v-model="videoDuration" required>
      </div>
      <div class="form-group">
        <label for="video" class="file-input-label">
          <span>Seleziona Video</span>
          <input type="file" id="video" @change="handleVideoUpload" accept="video/*" required>
        </label>
        <span v-if="videoFile" class="file-name">{{ videoFile.name }}</span>
      </div>
      <div class="form-group">
        <label for="transcript">Transcript</label>
        <textarea id="transcript" v-model="videoTranscript" rows="5" required></textarea>
      </div>
      <button type="submit" :disabled="isUploading" class="submit-btn">
        {{ isUploading ? 'Caricamento in corso...' : 'Carica Video' }}
      </button>
    </form>

    <div v-if="uploadStatus" :class="['upload-status', uploadStatus.type]">
      {{ uploadStatus.message }}
    </div>

    <h3>Video Caricati</h3>
    <div class="video-grid">
      <div v-for="video in videos" :key="video.id" class="video-item">
        <img :src="getFullUrl(video.thumbnailUrl)" :alt="video.title" class="video-thumbnail">
        <div class="video-info">
          <h4>{{ video.title }}</h4>
          <p>Durata: {{ video.duration }}</p>
        </div>
      </div>
    </div>

    <!-- Popup modale -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <p>Vuoi tornare alla home?</p>
        <button @click="goToHome">Sì</button>
        <button @click="closeModal">No</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

interface Video {
  id: number;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl: string;
  transcript: string;
}

export default defineComponent({
  name: 'AdminView',
  setup() {
    const router = useRouter();
    const videoTitle = ref('');
    const videoDuration = ref('');
    const videoFile = ref<File | null>(null);
    const videoTranscript = ref('');
    const isUploading = ref(false);
    const uploadStatus = ref<{ type: 'success' | 'error', message: string } | null>(null);
    const videos = ref<Video[]>([]);
    const showModal = ref(false);

    const handleVideoUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        videoFile.value = target.files[0];
      }
    };

    const uploadVideo = async () => {
      if (!videoFile.value) {
        alert('Per favore, seleziona un file video.');
        return;
      }

      isUploading.value = true;
      uploadStatus.value = null;

      const formData = new FormData();
      formData.append('title', videoTitle.value);
      formData.append('duration', videoDuration.value);
      formData.append('transcript', videoTranscript.value);
      formData.append('video', videoFile.value);

      try {
        const response = await axios.post('http://localhost:3000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Video caricato:', response.data);
        uploadStatus.value = { type: 'success', message: 'Video caricato con successo!' };
        
        videos.value.push(response.data);

        videoTitle.value = '';
        videoDuration.value = '';
        videoFile.value = null;
        videoTranscript.value = '';

        showModal.value = true;

      } catch (error) {
        console.error('Errore nel caricamento del video:', error);
        uploadStatus.value = { type: 'error', message: 'Errore nel caricamento del video. Riprova.' };
      } finally {
        isUploading.value = false;
      }
    };

    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/videos');
        videos.value = response.data;
      } catch (error) {
        console.error('Errore nel caricamento dei video:', error);
        alert('Errore nel caricamento della lista dei video');
      }
    };

    const getFullUrl = (path: string) => {
      return `http://localhost:3000${path}`;
    };

    const goToHome = () => {
      router.push('/');
    };

    const closeModal = () => {
      showModal.value = false;
    };

    onMounted(fetchVideos);

    return {
      videoTitle,
      videoDuration,
      videoFile,
      videoTranscript,
      isUploading,
      uploadStatus,
      videos,
      handleVideoUpload,
      uploadVideo,
      getFullUrl,
      showModal,
      goToHome,
      closeModal
    };
  }
});
</script>

<style scoped>
.admin-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2, h3 {
  color: #333;
  text-align: center;
  margin-bottom: 1.5rem;
}

.upload-form {
  display: grid;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

input[type="text"],
textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.file-input-label {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #6200EA;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.file-input-label:hover {
  background-color: #5000c7;
}

input[type="file"] {
  display: none;
}

.file-name {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #84FFFF;
  color: #333;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #5cffff;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.upload-status {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.upload-status.success {
  background-color: #4CAF50;
  color: white;
}

.upload-status.error {
  background-color: #f44336;
  color: white;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.video-item {
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
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

.video-info {
  padding: 1rem;
}

.video-info h4 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.video-info p {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #666;
}

.modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fefefe;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.modal-content button {
  margin: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.modal-content button:first-of-type {
  background-color: #4CAF50;
  color: white;
}

.modal-content button:last-of-type {
  background-color: #f44336;
  color: white;
}
</style>