<template>
  <div>
    <div v-if="isAdminUser">
      <button @click="openCreateModal" class="btn btn-primary mb-4">
        Crea nuova playlist
      </button>
    </div>

    <div v-if="playlists.length === 0" class="text-gray-600 dark:text-gray-400">
      Nessuna playlist disponibile.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="playlist in playlists"
        :key="playlist.id"
        class="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4"
      >
        <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {{ playlist.name }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-2">
          {{ playlist.videos.length }} video
        </p>
        <button @click="viewPlaylist(playlist)" class="btn btn-secondary mr-2">
          Visualizza
        </button>
        <template v-if="isAdminUser">
          <button
            @click="editPlaylist(playlist)"
            class="btn btn-secondary mr-2"
          >
            Modifica
          </button>
          <button @click="deletePlaylist(playlist.id)" class="btn btn-danger">
            Elimina
          </button>
        </template>
      </div>
    </div>

    <!-- Modal per creare/modificare playlist -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-3xl w-full">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {{ editingPlaylist ? "Modifica" : "Crea" }} Playlist
        </h2>
        <input
          v-model="playlistName"
          placeholder="Nome playlist"
          class="w-full mb-4 p-2 border rounded"
        />
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Seleziona video
          </h3>
          <div class="max-h-60 overflow-y-auto">
            <div
              v-for="video in availableVideos"
              :key="video.id"
              class="flex items-center mb-2"
            >
              <input
                type="checkbox"
                :id="video.id"
                v-model="selectedVideos"
                :value="video.id"
                class="mr-2"
              />
              <label :for="video.id" class="text-gray-700 dark:text-gray-300">{{
                video.title
              }}</label>
            </div>
          </div>
        </div>
        <div class="flex justify-end">
          <button @click="closeModal" class="btn btn-danger mr-2">
            Annulla
          </button>
          <button @click="savePlaylist" class="btn btn-primary">Salva</button>
        </div>
      </div>
    </div>

    <!-- Modal per visualizzare i video della playlist -->
    <div
      v-if="showPlaylistModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {{ selectedPlaylist?.name }}
        </h2>
        <Cards
          :videos="playlistVideos"
          :baseUrl="baseUrl"
          @open-video-modal="openVideoModal"
        />
        <div class="flex justify-end mt-4">
          <button @click="closePlaylistModal" class="btn btn-secondary">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import axios from "axios";
import Cards from "@/components/Cards.vue";

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
  name: "Playlist",
  components: {
    Cards,
  },
  setup() {
    const playlists = ref<Playlist[]>([]);
    const availableVideos = ref<Video[]>([]);
    const showModal = ref(false);
    const playlistName = ref("");
    const selectedVideos = ref<string[]>([]);
    const editingPlaylist = ref<Playlist | null>(null);
    const showPlaylistModal = ref(false);
    const selectedPlaylist = ref<Playlist | null>(null);
    const playlistVideos = ref<Video[]>([]);
    const baseUrl = "http://localhost:3000";

    const isAdminUser = computed(() => {
      return localStorage.getItem("userRole") === "admin";
    });

    const fetchPlaylists = async () => {
      try {
        const response = await axios.get("http://localhost:3000/playlists");
        playlists.value = response.data;
      } catch (error) {
        console.error("Errore nel recupero delle playlist:", error);
      }
    };

    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://localhost:3000/videos");
        availableVideos.value = response.data;
      } catch (error) {
        console.error("Errore nel recupero dei video:", error);
      }
    };

    const openCreateModal = () => {
      editingPlaylist.value = null;
      playlistName.value = "";
      selectedVideos.value = [];
      showModal.value = true;
    };

    const editPlaylist = (playlist: Playlist) => {
      editingPlaylist.value = playlist;
      playlistName.value = playlist.name;
      selectedVideos.value = [...playlist.videos];
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      editingPlaylist.value = null;
      playlistName.value = "";
      selectedVideos.value = [];
    };

    const savePlaylist = async () => {
      if (!playlistName.value) {
        alert("Inserisci un nome per la playlist");
        return;
      }

      const playlistData = {
        name: playlistName.value,
        videos: selectedVideos.value,
        color: generateColor(),
      };

      try {
        if (editingPlaylist.value) {
          await axios.put(
            `http://localhost:3000/playlists/${editingPlaylist.value.id}`,
            playlistData
          );
        } else {
          await axios.post("http://localhost:3000/playlists", playlistData);
        }
        closeModal();
        fetchPlaylists();
      } catch (error) {
        console.error("Errore nel salvataggio della playlist:", error);
        alert("Si è verificato un errore nel salvataggio della playlist");
      }
    };

    //riferimento https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/

    const hsvToRgb = (h: number, s: number, v: number): number[] => {
      const h_i = Math.floor(h * 6);
      const f = h * 6 - h_i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      let t = v * (1 - (1 - f) * s);
      let r, g, b;

      if (h_i === 0) {
        r = v;
        g = t;
        b = p;
      } else if (h_i === 1) {
        r = q;
        g = v;
        b = p;
      } else if (h_i === 2) {
        r = p;
        g = v;
        b = t;
      } else if (h_i === 3) {
        r = p;
        g = q;
        b = v;
      } else if (h_i === 4) {
        r = t;
        g = p;
        b = v;
      } else if (h_i === 5) {
        r = v;
        g = p;
        b = q;
      }

      let firstValue = Math.floor((r ?? 0) * 256);
      let secondValue = Math.floor((g ?? 0) * 256);
      let thirdValue = Math.floor((b ?? 0) * 256);

      playlists.value.forEach((playlist) => {
        while (
          Math.abs(playlist.color[0] - firstValue) < 20 &&
          Math.abs(playlist.color[1] - secondValue) < 20 &&
          Math.abs(playlist.color[2] - thirdValue) < 20
        ) {
          h += goldenRatioConjugate;
          h %= 1;
          [firstValue, secondValue, thirdValue] = hsvToRgb(h, 0.5, 0.95);
        }
      });

      return [firstValue, secondValue, thirdValue];
    };

    const goldenRatioConjugate = 0.618033988749895;
    let h = Math.random(); // use random start value

    const generateColor = () => {
      h += goldenRatioConjugate;
      h %= 1;
      return hsvToRgb(h, 0.5, 0.95);
    };

    const deletePlaylist = async (playlistId: string) => {
      if (confirm("Sei sicuro di voler eliminare questa playlist?")) {
        try {
          await axios.delete(`http://localhost:3000/playlists/${playlistId}`);
          fetchPlaylists();
        } catch (error) {
          console.error("Errore nell'eliminazione della playlist:", error);
          alert("Si è verificato un errore nell'eliminazione della playlist");
        }
      }
    };

    const viewPlaylist = async (playlist: Playlist) => {
      selectedPlaylist.value = playlist;
      try {
        const videoPromises = playlist.videos.map((videoId) =>
          axios.get(`${baseUrl}/videos/${videoId}`)
        );
        const videoResponses = await Promise.all(videoPromises);
        playlistVideos.value = videoResponses.map((response) => response.data);
        showPlaylistModal.value = true;
      } catch (error) {
        console.error("Errore nel recupero dei video della playlist:", error);
        alert(
          "Si è verificato un errore nel caricamento dei video della playlist"
        );
      }
    };

    const closePlaylistModal = () => {
      showPlaylistModal.value = false;
      selectedPlaylist.value = null;
      playlistVideos.value = [];
    };

    const openVideoModal = (video: Video) => {
      // Implementa la logica per aprire il video player
      console.log("Apri video:", video);
    };

    onMounted(() => {
      fetchPlaylists();
      fetchVideos();
    });

    return {
      playlists,
      availableVideos,
      showModal,
      playlistName,
      selectedVideos,
      editingPlaylist,
      isAdminUser,
      openCreateModal,
      editPlaylist,
      closeModal,
      savePlaylist,
      deletePlaylist,
      showPlaylistModal,
      selectedPlaylist,
      playlistVideos,
      baseUrl,
      viewPlaylist,
      closePlaylistModal,
      openVideoModal,
    };
  },
});
</script>
