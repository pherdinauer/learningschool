<template>
  <div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-800 dark:bg-opacity-75" aria-hidden="true"></div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div class="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
            Carica Video
          </h3>
          <div class="mt-4 space-y-4">
            <div class="flex items-center justify-center w-full">
              <label for="file-upload" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                <div v-if="!file" class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Clicca per caricare</span> o trascina e rilascia</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">MP4, AVI, MOV (MAX. 800MB)</p>
                </div>
                <div v-else class="w-full px-4">
                  <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">{{ file.name }}</p>
                  <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      class="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                      :class="{ 'bg-green-500': uploadProgress === 100 }"
                      :style="{ width: `${uploadProgress}%` }"
                    ></div>
                  </div>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ uploadProgress }}% caricato</p>
                </div>
              </label>
              <input id="file-upload" type="file" class="hidden" @change="handleFileChange" accept="video/*" />
            </div>
            <input v-model="title" placeholder="Titolo del Video" class="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500">
            <textarea v-model="transcript" placeholder="Trascrizione del Video" class="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" rows="4"></textarea>
            <div class="flex items-center space-x-2">
              <input
                v-model="newTag"
                @keyup.enter="addTag"
                placeholder="Aggiungi un tag"
                class="flex-grow p-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                @click="addTag"
                class="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Aggiungi
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(tag, index) in tags"
                :key="index"
                class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md flex items-center"
              >
                {{ tag }}
                <button @click="removeTag(index)" class="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </span>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button @click="uploadVideo" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm dark:bg-blue-700 dark:hover:bg-blue-800">
            Carica
          </button>
          <button @click="$emit('close')" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
            Annulla
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';
import eventBus from '@/eventBus';

// Definiamo un'interfaccia per l'evento di progresso
interface ProgressEvent {
  loaded: number;
  total?: number;
}

export default defineComponent({
  name: 'UploadModal',
  emits: ['close', 'videoUploaded'],
  setup(props, { emit }) {
    const file = ref<File | null>(null);
    const title = ref('');
    const transcript = ref('');
    const tags = ref<string[]>([]);
    const newTag = ref('');
    const uploadProgress = ref(0);

    const handleFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        file.value = target.files[0];
        uploadProgress.value = 0; // Resetta il progresso quando viene selezionato un nuovo file
      }
    };

    const addTag = () => {
      if (newTag.value.trim()) {
        tags.value.push(newTag.value.trim());
        newTag.value = '';
      }
    };

    const removeTag = (index: number) => {
      tags.value.splice(index, 1);
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
          },
          onUploadProgress: (progressEvent: ProgressEvent) => {
            if (progressEvent.total) {
              uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            }
          }
        });
        console.log('Upload successful:', response.data);
        emit('videoUploaded');
        emit('close');
        eventBus.$emit('video-uploaded');
      } catch (error) {
        console.error('Error uploading video:', error);
        alert('Error uploading video');
      }
    };

    return {
      file,
      title,
      transcript,
      tags,
      newTag,
      uploadProgress,
      handleFileChange,
      addTag,
      removeTag,
      uploadVideo
    };
  }
});
</script>