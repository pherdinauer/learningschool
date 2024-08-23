<template>
  <div class="flex custom-scrollbar">
    <div class="w-full overflow-y-auto h-screen pb-20">
      <Cards 
        :videos="filteredVideos" 
        :baseUrl="baseUrl"
        @toggle-favorite="toggleFavorite"
        @open-video-modal="openVideoModal"
      />
    </div>

    <!-- Video Modal -->
    <VideoPlayer
      v-if="selectedVideo"
      :videoUrl="getFullUrl(selectedVideo?.videoUrl)"
      :videoTitle="selectedVideo?.title"
      :transcript="selectedVideo?.transcript"
      :currentTime="selectedVideo?.currentTime || 0"
      @close="closeVideoModal"
      @timeUpdate="updateVideoTime"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import eventBus from '@/eventBus';
import VideoPlayer from './VideoPlayer.vue';
import Cards from '@/components/Cards.vue';

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  thumbnailVersion?: number;
  duration: number;
  tags: string[];
  transcript: string;
  currentTime?: number;
}

export default defineComponent({
  name: 'HomeView',
  components: {
    VideoPlayer,
    Cards
  },
  props: {
    searchQuery: {
      type: String,
      default: ''
    },
    selectedTag: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const videos = ref<Video[]>([]);
    const selectedVideo = ref<Video | null>(null);
    const favorites = ref<string[]>(JSON.parse(localStorage.getItem('favorites') || '[]'));
    const baseUrl = 'http://localhost:3000';

    const fetchVideos = async () => {
      try {
        const response = await fetch(`${baseUrl}/videos`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Video[] = await response.json();
        videos.value = data;
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    const filteredVideos = computed(() => {
      return videos.value.filter(video =>
        (props.selectedTag ? video.tags.includes(props.selectedTag) : true) &&
        (video.title.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
         video.transcript.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
         video.tags.some(tag => tag.toLowerCase().includes(props.searchQuery.toLowerCase()))
        )
      );
    });

    const toggleFavorite = (video: Video) => {
      const index = favorites.value.indexOf(video.id);
      if (index === -1) {
        favorites.value.push(video.id);
      } else {
        favorites.value.splice(index, 1);
      }
      localStorage.setItem('favorites', JSON.stringify(favorites.value));
    };

    const openVideoModal = (video: Video) => {
      selectedVideo.value = { ...video, currentTime: video.currentTime || 0 };
    };

    const closeVideoModal = () => {
      selectedVideo.value = null;
    };

    const updateVideoTime = (time: number) => {
      if (selectedVideo.value) {
        selectedVideo.value.currentTime = time;
      }
    };

    const getFullUrl = (url: string) => {
      if (url.startsWith('http')) {
        return url;
      }
      return `${baseUrl}${url}`;
    };

    onMounted(() => {
      fetchVideos();
      eventBus.$on('video-uploaded', fetchVideos);
    });

    onUnmounted(() => {
      eventBus.$off('video-uploaded', fetchVideos);
    });

    watch(() => props.searchQuery, fetchVideos);

    return { 
      filteredVideos, 
      selectedVideo, 
      openVideoModal, 
      closeVideoModal,
      getFullUrl,
      toggleFavorite,
      updateVideoTime,
      baseUrl,
    };
  }
});
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
  border: transparent;
}

:global(.dark) .custom-scrollbar {
  scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}
</style>