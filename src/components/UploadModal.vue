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
            <div 
              class="flex items-center justify-center w-full"
              @dragover.prevent
              @drop.prevent="handleFileDrop"
            >
              <label 
                for="file-upload" 
                class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
              >
                <div v-if="!file" class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Clicca per caricare</span> o trascina qui il file</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">MP4, AVI, MOV (MAX. 800MB)</p>
                </div>
                <div v-else class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-10 h-10 mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <p class="mb-2 text-sm text-gray-700 dark:text-gray-300">File selezionato: <span class="font-semibold">{{ file.name }}</span></p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Clicca per cambiare il file</p>
                </div>
              </label>
              <input id="file-upload" type="file" class="hidden" @change="handleFileChange" accept="video/*" />
            </div>
            <input v-model="title" placeholder="Titolo del Video" class="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500">
            <textarea v-model="transcript" placeholder="Trascrizione del Video" class="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" rows="4"></textarea>
            <div class="flex items-center space-x-2">
              <input
                v-model="newTag"
                @keyup.enter="addTag"
                placeholder="Aggiungi un tag"
                class="flex-grow p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                @click="addTag"
                class="btn-primary btn-sm"
              >
                Aggiungi
              </button>
            </div>
            <div class="flex flex-wrap mt-2">
              <span
                v-for="(tag, index) in tags"
                :key="index"
                class="tag flex items-center"
              >
                {{ tag }}
                <button
                  @click="removeTag(index)"
                  class="ml-1 text-xs font-bold hover:text-red-500 transition-colors duration-300"
                  aria-label="Rimuovi tag"
                >
                  &times;
                </button>
              </span>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button @click="uploadVideo" type="button" class="btn-primary w-full sm:w-auto sm:ml-3">
            Carica Video
          </button>
          <button @click="$emit('close')" type="button" class="btn-danger w-full sm:w-auto mt-3 sm:mt-0">
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

    const handleFileDrop = (event: DragEvent) => {
      if (event.dataTransfer?.files) {
        file.value = event.dataTransfer.files[0];
        uploadProgress.value = 0;
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
      handleFileDrop,
      addTag,
      removeTag,
      uploadVideo
    };
  }
});
</script>

<style scoped>
.btn-primary {
  @apply font-bold bg-blue-600 text-white rounded transition-colors duration-300 py-2 px-4 shadow-md;
}

.btn-primary:hover {
  @apply bg-blue-700;
}

.btn-danger {
  @apply font-bold bg-red-600 text-white rounded transition-colors duration-300 py-2 px-4 shadow-md;
}

.btn-danger:hover {
  @apply bg-red-700;
}

.btn-sm {
  @apply text-sm py-1 px-2;
}

.tag {
  @apply bg-blue-500 text-white text-xs py-1 px-2 rounded mr-2 mb-2 shadow-sm;
}

:root {
  --color-primary: #3490dc;
  --color-primary-dark: #2779bd;
  --color-danger: #e3342f;
  --color-danger-dark: #cc1f1a;
}

.dark {
  --color-primary: #4299e1;
  --color-primary-dark: #3182ce;
  --color-danger: #f56565;
  --color-danger-dark: #e53e3e;
}
</style>