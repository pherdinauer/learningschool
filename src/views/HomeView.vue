<template>
  <div class="flex flex-col custom-scrollbar">
    <!-- Tag filter bar -->
    <div class="tag-filter-bar overflow-x-auto">
      <div class="flex tagContainer">
        <button
          v-for="tag in uniqueTags"
          :key="tag"
          @click="toggleTagFilter(tag)"
          :class="[
            'tagButton',
            selectedTag === tag || (selectedTag == null && tag == 'Tutti')
              ? 'selectedTag'
              : '',
          ]"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <div class="w-full overflow-y-auto h-screen pb-20">
      <h2
        class="text-2xl font-bold mb-4 text-gray-900 dark:text-white sectionTitle"
      >
        Playlist
      </h2>
      <div>
        <PlaylistCards
          :playlists="playlists"
          @open-playlist-modal="openPlaylistModal"
        />
      </div>

      <h2
        class="text-2xl font-bold mb-4 text-gray-900 dark:text-white sectionTitle"
      >
        Video
      </h2>
      <div v-if="filteredVideos.length > 0">
        <Cards
          :videos="filteredVideos"
          :baseUrl="baseUrl"
          @open-video-modal="openVideoModal"
          @favorites-updated="updateFavorites"
        />
      </div>
      <div v-else class="text-center py-10">
        <p class="text-xl text-gray-600 dark:text-gray-400">
          Non ci sono risultati
        </p>
      </div>
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

    <!-- Playlist Modal -->
    <PlaylistModal
      v-if="selectedPlaylist"
      :playlist="selectedPlaylist"
      :videos="playlistVideos"
      :baseUrl="baseUrl"
      @close="closePlaylistModal"
      @open-video-modal="openVideoModal"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  watch,
  onUnmounted,
} from "vue";
import VideoPlayer from "./VideoPlayer.vue";
import Cards from "@/components/Cards.vue";
import PlaylistCards from "@/components/PlaylistCards.vue";
import PlaylistModal from "@/components/PlaylistModal.vue";
import axios from "axios";
import "../assets/home.scss";
import eventBus from "@/eventBus";

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
  color: number[];
  videos: string[];
}

export default defineComponent({
  name: "HomeView",
  components: {
    VideoPlayer,
    Cards,
    PlaylistModal,
    PlaylistCards,
  },
  props: {
    searchQuery: {
      type: String,
      default: "",
    },
    selectedTag: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const videos = ref<Video[]>([]);
    const selectedVideo = ref<Video | null>(null);
    const favorites = ref<string[]>(
      JSON.parse(localStorage.getItem("favorites") || "[]")
    );
    const selectedPlaylist = ref<Playlist | null>(null);

    const baseUrl = "http://localhost:3000";
    const playlistVideos = ref<Video[]>([]);
    const refreshKey = ref(0);
    const playlists = ref<Playlist[]>([]);

    const fetchVideos = async () => {
      try {
        const response = await axios.get(`${baseUrl}/videos`);
        videos.value = response.data;
      } catch (error) {
        console.error("Errore nel recupero dei video:", error);
      }
    };

    const fetchPlaylists = async () => {
      try {
        const response = await axios.get(`${baseUrl}/playlists`);
        playlists.value = response.data;
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    const openPlaylistModal = async (playlist: Playlist) => {
      selectedPlaylist.value = playlist;
      try {
        const videoPromises = playlist.videos.map((videoId) =>
          axios.get(`${baseUrl}/videos/${videoId}`)
        );
        const videoResponses = await Promise.all(videoPromises);
        playlistVideos.value = videoResponses.map((response) => response.data);
      } catch (error) {
        console.error("Errore nel recupero dei video della playlist:", error);
        alert(
          "Si è verificato un errore nel caricamento dei video della playlist"
        );
      }
    };

    const closePlaylistModal = () => {
      selectedPlaylist.value = null;
      playlistVideos.value = [];
    };

    const filteredVideos = computed(() => {
      return videos.value.filter(
        (video) =>
          (!selectedTag.value || video.tags.includes(selectedTag.value)) &&
          (video.transcript
            .toLowerCase()
            .includes(props.searchQuery.toLowerCase()) ||
            video.title
              .toLowerCase()
              .includes(props.searchQuery.toLowerCase()) ||
            video.tags.some((tag) =>
              tag.toLowerCase().includes(props.searchQuery.toLowerCase())
            ))
      );
    });

    const toggleFavorite = (video: Video) => {
      const index = favorites.value.indexOf(video.id);
      if (index === -1) {
        favorites.value.push(video.id);
      } else {
        favorites.value.splice(index, 1);
      }
      localStorage.setItem("favorites", JSON.stringify(favorites.value));
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
        const index = videos.value.findIndex(
          (v) => v.id === selectedVideo.value!.id
        );
        if (index !== -1) {
          videos.value[index].currentTime = time;
        }
      }
    };

    const getFullUrl = (url: string) => {
      if (url.startsWith("http")) {
        return url;
      }
      return `${baseUrl}${url}`;
    };

    const updateFavorites = (newFavorites: string[]) => {
      favorites.value = newFavorites;
    };

    const uniqueTags = computed(() => {
      const allTags = videos.value.flatMap((video) => video.tags);
      return ["Tutti", ...new Set(allTags)];
    });

    const selectedTag = ref<string | null>(null);

    const toggleTagFilter = (tag: string) => {
      if (tag === "Tutti" || selectedTag.value === tag) {
        selectedTag.value = null;
      } else {
        selectedTag.value = tag;
      }
    };

    const handleNewVideo = () => {
      console.log("Nuovo video rilevato, aggiornamento in corso...");
      setTimeout(() => {
        fetchVideos();
      }, 2000); // Ritardo di 2 secondi
    };

    onMounted(() => {
      fetchVideos();
      fetchPlaylists();
      eventBus.$on("video-uploaded", handleNewVideo);
    });

    onUnmounted(() => {
      eventBus.$off("video-uploaded", handleNewVideo);
    });

    watch(videos, () => {
      refreshKey.value++;
    });

    return {
      filteredVideos,
      selectedVideo,
      openVideoModal,
      closeVideoModal,
      getFullUrl,
      toggleFavorite,
      updateVideoTime,
      baseUrl,
      favorites,
      playlists,
      playlistVideos,
      updateFavorites,
      openPlaylistModal,
      closePlaylistModal,
      selectedPlaylist,
      uniqueTags,
      selectedTag,
      toggleTagFilter,
      refreshKey,
    };
  },
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

.tag-filter-bar {
  position: sticky;
  top: 64px;
  z-index: 10;
  border-bottom: 1px solid #e5e7eb;
}

.dark .tag-filter-bar {
  border-bottom-color: #4b5563;
}

.tag-filter-bar .flex {
  padding-bottom: 0.5rem;
}

.tag-filter-bar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tag-filter-bar::-webkit-scrollbar {
  display: none;
}
</style>
