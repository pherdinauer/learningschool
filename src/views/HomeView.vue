<template>
  <div class="flex custom-scrollbar">
    <div class="w-full overflow-y-auto h-screen pb-20">
      <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Playlist
      </h2>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
      >
        <div
          v-for="playlist in playlists"
          :key="playlist.id"
          class="custom-card rounded-lg shadow-md overflow-hidden relative bg-white dark:bg-gray-800 cursor-pointer playlistCard"
          @click="openPlaylistModal(playlist)"
        >
          <div class="playlistIcon">
            <svg
              id="fi_4043797"
              height="512"
              viewBox="0 0 512 512"
              width="512"
              xmlns="http://www.w3.org/2000/svg"
              data-name="Layer 1"
              :fill="
                'rgb(' +
                playlist.color[0] +
                ',' +
                playlist.color[1] +
                ',' +
                playlist.color[2] +
                ')'
              "
            >
              <path
                d="m280.593 449.83a16 16 0 0 1 -16 16h-248.593a16 16 0 0 1 0-32h248.593a16 16 0 0 1 16 16zm-16-151.538h-248.593a16 16 0 0 0 0 32h248.593a16 16 0 0 0 0-32zm-248.593-239.076h480a16 16 0 0 0 0-32h-480a16 16 0 0 0 0 32zm496 322.845a16 16 0 0 1 -7.773 13.723l-144.673 86.724a16 16 0 0 1 -24.226-13.724v-173.447a16 16 0 0 1 24.226-13.724l144.672 86.724a16 16 0 0 1 7.774 13.724zm-47.12 0-97.552-58.478v116.956zm31.12-219.307h-480a16 16 0 0 0 0 32h480a16 16 0 0 0 0-32z"
              ></path>
            </svg>
          </div>

          <div class="playlistDescriptionWrapper">
            <h3 class="text-lg font-semibold mb-2 line-clamp-2">
              {{ playlist.name }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              {{ playlist.videos.length }} video
            </p>
          </div>
        </div>
      </div>

      <h2
        class="text-2xl font-bold mb-4 text-gray-900 dark:text-white sectionTitle"
      >
        Video
      </h2>
      <Cards
        :videos="filteredVideos"
        :baseUrl="baseUrl"
        :favorites="favorites"
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
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import VideoPlayer from "./VideoPlayer.vue";
import Cards from "@/components/Cards.vue";
import PlaylistModal from "@/components/PlaylistModal.vue";
import axios from "axios";
import "../assets/home.scss";

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
  color: string;
  videos: string[];
}

export default defineComponent({
  name: "HomeView",
  components: {
    VideoPlayer,
    Cards,
    PlaylistModal,
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
    const baseUrl = "http://localhost:3000";
    const playlists = ref<Playlist[]>([]);
    const selectedPlaylist = ref<Playlist | null>(null);
    const playlistVideos = ref<Video[]>([]);

    const fetchVideos = async () => {
      try {
        const response = await fetch(`${baseUrl}/videos`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: Video[] = await response.json();
        videos.value = data;
      } catch (error) {
        console.error("Error fetching videos:", error);
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

    const filteredVideos = computed(() => {
      return videos.value.filter(
        (video) =>
          (props.selectedTag ? video.tags.includes(props.selectedTag) : true) &&
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
        // Aggiorna anche il video nell'array videos
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

    onMounted(() => {
      fetchVideos();
      fetchPlaylists();
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
      favorites,
      playlists,
      selectedPlaylist,
      playlistVideos,
      openPlaylistModal,
      closePlaylistModal,
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
</style>
