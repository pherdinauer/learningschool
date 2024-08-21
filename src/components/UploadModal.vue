<template>
    <div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              Upload Video
            </h3>
            <div class="mt-2">
              <input type="file" @change="handleFileChange" accept="video/*" class="mb-4">
              <input v-model="title" placeholder="Video Title" class="w-full p-2 mb-4 border rounded">
              <textarea v-model="transcript" placeholder="Video Transcript" class="w-full p-2 mb-4 border rounded" rows="4"></textarea>
              <div class="flex mb-2">
                <input v-model="tagInput" @keyup.enter.prevent="addTag" placeholder="Add tags (press Enter to add)" class="flex-grow p-2 border rounded-l">
                <button @click="addTag" class="bg-blue-500 text-white px-4 rounded-r">Add Tag</button>
              </div>
              <div class="flex flex-wrap mb-4">
                <span v-for="tag in tags" :key="tag" class="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2">
                  {{ tag }}
                  <button @click="removeTag(tag)" class="ml-1 text-blue-600 hover:text-blue-800">&times;</button>
                </span>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="uploadVideo" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
              Upload
            </button>
            <button @click="$emit('close')" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancel
            </button>
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
      const file = ref<File | null>(null);
      const title = ref('');
      const transcript = ref('');
      const tagInput = ref('');
      const tags = ref<string[]>([]);
  
      const handleFileChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.files) {
          file.value = target.files[0];
        }
      };
  
      const addTag = () => {
        const newTag = tagInput.value.trim();
        if (newTag && !tags.value.includes(newTag)) {
          tags.value.push(newTag);
          tagInput.value = '';
        }
      };
  
      const removeTag = (tagToRemove: string) => {
        tags.value = tags.value.filter(tag => tag !== tagToRemove);
      };
  
      const uploadVideo = async () => {
        if (!file.value) {
          alert('Please select a file');
          return;
        }
  
        const formData = new FormData();
        formData.append('video', file.value);
        formData.append('title', title.value);
        formData.append('transcript', transcript.value);
        formData.append('tags', JSON.stringify(tags.value));
  
        try {
          const response = await axios.post('http://localhost:3000/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          console.log('Upload successful:', response.data);
          emit('videoUploaded');
          emit('close');
        } catch (error) {
          console.error('Error uploading video:', error);
          alert('Error uploading video');
        }
      };
  
      return {
        title,
        transcript,
        tagInput,
        tags,
        handleFileChange,
        uploadVideo,
        addTag,
        removeTag
      };
    }
  });
  </script>