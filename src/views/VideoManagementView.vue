<template>
    <div class="container mx-auto px-4">
      <h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Video Management</h1>
      <div v-if="loading" class="text-center">
        <p class="text-gray-600 dark:text-gray-400">Loading videos...</p>
      </div>
      <div v-else-if="videos.length === 0" class="text-center">
        <p class="text-gray-600 dark:text-gray-400">No videos found.</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="video in videos" :key="video.id" class="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
          <img :src="getFullUrl(video.thumbnailUrl)" :alt="video.title" class="w-full h-48 object-cover cursor-pointer" @click="playVideo(video)">
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{{ video.title }}</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-4">Duration: {{ formatDuration(video.duration) }}</p>
            <div class="flex space-x-2">
              <button @click="editVideo(video)" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Edit
              </button>
              <button @click="deleteVideo(video.id)" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal for video player -->
      <div v-if="selectedVideo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-3xl w-full">
          <VideoPlayer :videoUrl="getFullUrl(selectedVideo.videoUrl)" />
          <button @click="selectedVideo = null" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Close
          </button>
        </div>
      </div>
  
      <!-- Modal for editing video -->
      <div v-if="editingVideo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-3xl w-full">
          <h2 class="text-xl font-bold mb-4">Edit Video</h2>
          <input v-model="editingVideo.title" class="w-full p-2 mb-4 border rounded" placeholder="Video Title">
          <textarea v-model="editingVideo.transcript" class="w-full p-2 mb-4 border rounded" placeholder="Video Transcript" rows="4"></textarea>
          <div class="flex justify-end space-x-2">
            <button @click="cancelEdit" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
              Cancel
            </button>
            <button @click="saveEdit" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import axios from 'axios';
  import VideoPlayer from './VideoPlayer.vue';
  
  interface Video {
    id: string;
    title: string;
    duration: number;
    thumbnailUrl: string;
    videoUrl: string;
    transcript: string;
  }
  
  export default defineComponent({
    name: 'VideoManagementView',
    components: {
      VideoPlayer
    },
    setup() {
      const videos = ref<Video[]>([]);
      const loading = ref(true);
      const selectedVideo = ref<Video | null>(null);
      const editingVideo = ref<Video | null>(null);
      const baseUrl = 'http://localhost:3000'; // Assicurati che questa sia l'URL corretta del tuo server
  
      const fetchVideos = async () => {
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
        if (confirm('Are you sure you want to delete this video?')) {
          try {
            await axios.delete(`${baseUrl}/videos/${videoId}`);
            videos.value = videos.value.filter(video => video.id !== videoId);
          } catch (error) {
            console.error('Error deleting video:', error);
            alert('Failed to delete video. Please try again.');
          }
        }
      };
  
      const editVideo = (video: Video) => {
        editingVideo.value = { ...video };
      };
  
      const cancelEdit = () => {
        editingVideo.value = null;
      };
  
      const saveEdit = async () => {
        if (!editingVideo.value) return;
  
        try {
          const response = await axios.put(`${baseUrl}/videos/${editingVideo.value.id}`, {
            title: editingVideo.value.title,
            transcript: editingVideo.value.transcript
          });
          
          const index = videos.value.findIndex(v => v.id === editingVideo.value!.id);
          if (index !== -1) {
            videos.value[index] = response.data;
          }
          
          editingVideo.value = null;
        } catch (error) {
          console.error('Error updating video:', error);
          alert('Failed to update video. Please try again.');
        }
      };
  
      const formatDuration = (duration: number) => {
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      };
  
      const playVideo = (video: Video) => {
        selectedVideo.value = video;
      };
  
      const getFullUrl = (url: string) => {
        if (url.startsWith('http')) {
          return url;
        }
        return `${baseUrl}${url}`;
      };
  
      onMounted(fetchVideos);
  
      return {
        videos,
        loading,
        deleteVideo,
        formatDuration,
        selectedVideo,
        playVideo,
        getFullUrl,
        editVideo,
        editingVideo,
        cancelEdit,
        saveEdit
      };
    }
  });
  </script>