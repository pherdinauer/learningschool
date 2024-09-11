<template>
    <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ playlist.name }}
          </h2>
        </div>
        <div class="flex-grow overflow-y-auto custom-scrollbar p-6">
          <Cards 
            :videos="videos" 
            :baseUrl="baseUrl"
            @open-video-modal="openVideoAndClose"
          />
        </div>
        <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button @click="$emit('close')" class="btn btn-secondary">Chiudi</button>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import Cards from '@/components/Cards.vue';
  
  interface Video {
    id: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    tags: string[];
    transcript: string;
    currentTime?: number;
  }
  
  interface Playlist {
    id: string;
    name: string;
    videos: string[];
  }
  
  export default defineComponent({
    name: 'PlaylistModal',
    components: {
      Cards,
    },
    props: {
      playlist: {
        type: Object as PropType<Playlist>,
        required: true,
      },
      videos: {
        type: Array as PropType<Video[]>,
        required: true,
      },
      baseUrl: {
        type: String,
        required: true,
      },
    },
    emits: ['close', 'open-video-modal'],
    setup(props, { emit }) {
      const openVideoAndClose = (video: Video) => {
        emit('open-video-modal', video);
        emit('close');
      };

      return {
        openVideoAndClose,
      };
    },
  });
  </script>
  
  <style scoped>
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) rgba(229, 231, 235, 0.1);
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(229, 231, 235, 0.1);
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
    border: 3px solid rgba(229, 231, 235, 0.1);
  }

  :global(.dark) .custom-scrollbar {
    scrollbar-color: rgba(75, 85, 99, 0.5) rgba(31, 41, 55, 0.1);
  }

  :global(.dark) .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.1);
  }

  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(75, 85, 99, 0.5);
    border: 3px solid rgba(31, 41, 55, 0.1);
  }
  </style>