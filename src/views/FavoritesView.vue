<template>
  <div>
    <h2 class="text-2xl font-bold mb-4 dark:text-white">Favorite Videos</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="video in favoriteVideos"
        :key="video.id"
        class="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden relative"
      >
        <img
          :src="getFullUrl(video.thumbnailUrl)"
          :alt="video.title"
          class="w-full h-48 object-cover"
        />
        <div class="p-4">
          <div class="flex justify-between items-start">
            <h3 class="font-bold text-xl mb-2 dark:text-white">
              {{ video.title }}
            </h3>
            <button
              @click.stop="toggleFavorite(video)"
              class="text-yellow-500 hover:text-yellow-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="#ffc356"
                viewBox="0 0 24 24"
                stroke="#ffc356"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          </div>
          <p class="text-gray-600 dark:text-gray-300 text-sm mb-2">
            Duration: {{ formatDuration(video.duration) }}
          </p>
          <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">
            {{ video.transcript.substring(0, 100) }}...
          </p>
          <button
            @click="openVideoModal(video)"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Play
          </button>
        </div>
      </div>
    </div>

    <!-- Video Modal -->
    <div
      v-if="selectedVideo"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-4xl w-full">
        <h2 class="text-2xl font-bold mb-4 dark:text-white">
          {{ selectedVideo.title }}
        </h2>
        <video
          :src="getFullUrl(selectedVideo.videoUrl)"
          controls
          class="w-full mb-4"
        ></video>
        <h3 class="text-xl font-semibold mb-2 dark:text-white">Transcript:</h3>
        <p class="text-gray-700 dark:text-gray-300">
          {{ selectedVideo.transcript }}
        </p>
        <button
          @click="closeVideoModal"
          class="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import axios from "axios";

interface Video {
  id: number;
  title: string;
  duration: number;
  transcript: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export default defineComponent({
  name: "FavoritesView",
  setup() {
    const videos = ref<Video[]>([]);
    const selectedVideo = ref<Video | null>(null);
    const favorites = ref<number[]>(
      JSON.parse(localStorage.getItem("favorites") || "[]")
    );

    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://localhost:3000/videos");
        videos.value = response.data;
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    onMounted(fetchVideos);

    const favoriteVideos = computed(() => {
      return videos.value.filter((video) => favorites.value.includes(video.id));
    });

    const getFullUrl = (path: string) => {
      return `http://localhost:3000${path}`;
    };

    const openVideoModal = (video: Video) => {
      selectedVideo.value = video;
    };

    const closeVideoModal = () => {
      selectedVideo.value = null;
    };

    const formatDuration = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const toggleFavorite = (video: Video) => {
      const index = favorites.value.indexOf(video.id);
      if (index === -1) {
        favorites.value.push(video.id);
      } else {
        favorites.value.splice(index, 1);
      }
      localStorage.setItem("favorites", JSON.stringify(favorites.value));
    };

    return {
      favoriteVideos,
      selectedVideo,
      openVideoModal,
      closeVideoModal,
      getFullUrl,
      formatDuration,
      toggleFavorite,
    };
  },
});
</script>
