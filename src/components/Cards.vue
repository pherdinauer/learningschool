<template>
  <div
    class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
  >
    <div
      v-for="video in videos"
      :key="video.id"
      class="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden border border-gray-300 dark:border-gray-600"
    >
      <div
        class="relative cursor-pointer"
        @click="$emit('open-video-modal', video)"
      >
        <img
          :src="getFullUrl(video.thumbnailUrl)"
          alt="Video thumbnail"
          class="w-full h-28 object-cover"
        />
        <div
          class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300"
        >
          <svg
            class="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            ></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
      </div>
      <div class="p-2">
        <div class="top-wrapper">
          <h3
            class="text-sm font-semibold mb-1 text-gray-900 dark:text-white line-clamp-2"
          >
            {{ video.title }}
          </h3>
          <button
            @click.stop="toggleFavorite(video)"
            class="text-yellow-500 hover:text-yellow-600"
          >
            <svg
              data-v-7a7a37b1=""
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 20 20"
              :fill="isFavorite(video) ? '#ffc356' : 'none'"
            >
              <path
                data-v-7a7a37b1=""
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              ></path>
            </svg>
          </button>
        </div>

        <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">
          {{ formatDuration(video.duration) }}
        </p>
        <p class="text-xs text-gray-600 dark:text-gray-300 mb-1 line-clamp-2">
          {{ video.transcript }}
        </p>
        <div class="flex flex-wrap mb-1 status-tag-wrapper">
          <span
            v-for="tag in video.tags.slice(0, 2)"
            :key="tag"
            class="tag mr-1 mb-1 text-xs"
            >{{ tag }}</span
          >

          <div v-if="isCompleted(video)" class="completed-sign">
            <svg
              class="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <span class="text-sm font-medium">Completed</span>
          </div>
        </div>
        <div
          class="w-full bg-gray-200 rounded-full h-1.5 mt-1 dark:bg-gray-700"
        >
          <div
            class="bg-blue-600 h-1.5 rounded-full"
            :style="{ width: `${getCompletionPercentage(video)}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import "../assets/cards.scss";

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

export default defineComponent({
  name: "Cards",
  props: {
    videos: {
      type: Array as PropType<Video[]>,
      required: true,
    },
    baseUrl: {
      type: String,
      required: true,
    },
  },
  emits: ["open-video-modal"],
  setup(props) {
    const favorites = ref<string[]>(
      JSON.parse(localStorage.getItem("favorites") || "[]")
    );

    const getFullUrl = (url: string) => {
      if (url.startsWith("http")) {
        return url;
      }
      return `${props.baseUrl}${url}`;
    };

    const isFavorite = (video: Video) => {
      return favorites.value.includes(video.id);
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

    const formatDuration = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const isCompleted = (video: Video) => {
      return (
        video.currentTime &&
        video.duration &&
        video.currentTime / video.duration >= 0.9
      );
    };

    const getCompletionPercentage = (video: Video) => {
      if (!video.currentTime || !video.duration) return 0;
      return Math.min((video.currentTime / video.duration) * 100, 100);
    };

    return {
      getFullUrl,
      formatDuration,
      isCompleted,
      getCompletionPercentage,
      toggleFavorite,
      isFavorite,
    };
  },
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.tag {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-size: 0.6rem;
  padding: 0.1rem 0.2rem;
  border-radius: 9999px;
}

:global(.dark) .tag {
  background-color: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}
</style>
