<template>
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Upload Video</h3>
          <button @click="$emit('close')" class="absolute top-0 right-0 mt-4 mr-4 text-gray-500 hover:text-gray-700">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div class="mt-2 px-7 py-3">
            <form @submit.prevent="uploadVideo">
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="title">
                  Title
                </label>
                <input v-model="videoTitle" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="title" type="text" placeholder="Video Title">
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="video">
                  Video File
                </label>
                <input @change="handleVideoUpload" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="video" type="file" accept="video/*">
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="transcript">
                  Transcript
                </label>
                <textarea v-model="videoTranscript" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="transcript" rows="3" placeholder="Video Transcript"></textarea>
              </div>
              <div class="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  class="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import axios from 'axios';
  
  export default defineComponent({
    name: 'UploadModal',
    emits: ['close', 'videoUploaded'],
    setup(props, { emit }) {
      const videoTitle = ref('');
      const videoFile = ref<File | null>(null);
      const videoTranscript = ref('');
  
      const handleVideoUpload = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.files) {
          videoFile.value = target.files[0];
        }
      };
  
      const uploadVideo = async () => {
        if (!videoFile.value) {
          alert('Please select a video file.');
          return;
        }
  
        const formData = new FormData();
        formData.append('title', videoTitle.value);
        formData.append('transcript', videoTranscript.value);
        formData.append('video', videoFile.value);
  
        try {
          const response = await axios.post('http://localhost:3000/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          console.log('Video uploaded:', response.data);
          alert('Video uploaded successfully!');
          emit('videoUploaded');
        } catch (error) {
          console.error('Error uploading video:', error);
          alert('Error uploading video. Please try again.');
        }
      };
  
      return {
        videoTitle,
        videoTranscript,
        handleVideoUpload,
        uploadVideo
      };
    }
  });
  </script>