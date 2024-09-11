<template>
  <div
    :class="{ dark: isDarkMode }"
    class="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300"
  >
    <div class="flex h-screen">
      <!-- Sidebar (visibile solo se l'utente è loggato e non è nella pagina di login) -->
      <div
        v-if="isLoggedIn && !isLoginPage"
        :class="[
          'sidebar-gradient shadow-md flex flex-col transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64',
        ]"
      >
        <div class="p-4 mb-6 flex justify-between items-center">
          <img
            v-if="!isCollapsed"
            src="@/assets/logo.png"
            alt="Logo"
            class="w-32"
          />
          <button @click="toggleSidebar" class="btn-menu-transparent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <nav class="space-y-2">
          <router-link
            to="/"
            class="flex items-center py-3 px-6 text-lg text-white hover:bg-primary hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
              />
            </svg>
            <span v-if="!isCollapsed" class="ml-3">Home</span>
          </router-link>
          <router-link
            to="/favorites"
            class="flex items-center py-3 px-6 text-lg text-white hover:bg-primary hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
            <span v-if="!isCollapsed" class="ml-3">Favorites</span>
          </router-link>
          <router-link
            to="/playlists"
            class="flex items-center py-3 px-6 text-lg text-white hover:bg-primary hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span v-if="!isCollapsed" class="ml-3">Playlist</span>
          </router-link>
          <router-link
            v-if="isAdminUser"
            to="/video-management"
            class="flex items-center py-3 px-6 text-lg text-white hover:bg-primary hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"
              />
            </svg>
            <span v-if="!isCollapsed" class="ml-3">Manage Videos</span>
          </router-link>

          <!-- Sezione Tag (visibile sempre, con layout diverso in base allo stato del menu) -->
          <div class="py-3 px-6">
            <h2 class="text-lg font-semibold mb-2 text-white flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M17.707 9.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                  clip-rule="evenodd"
                />
              </svg>
              <span v-if="!isCollapsed">Tag</span>
            </h2>
            <div
              :class="[
                'space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar',
                { 'flex flex-col items-center': isCollapsed },
              ]"
            >
              <button
                v-for="tag in uniqueTags"
                :key="tag"
                @click="toggleTagFilter(tag)"
                :class="[
                  'w-full text-left flex justify-between items-center py-2 px-3 rounded transition-colors duration-200 text-white',
                  { 'bg-blue-600 hover:bg-blue-700': selectedTag === tag },
                  { 'hover:bg-primary': selectedTag !== tag },
                  { 'w-10 h-10 flex items-center justify-center': isCollapsed },
                ]"
                :title="tag"
              >
                <span v-if="!isCollapsed">{{ tag }}</span>
                <span v-else>{{ tag.charAt(0).toUpperCase() }}</span>
                <span
                  v-if="!isCollapsed && selectedTag === tag"
                  class="text-xs ml-2"
                  >&times;</span
                >
              </button>
            </div>
          </div>
        </nav>

        <div class="mt-auto">
          <button
            @click="logout"
            class="flex items-center py-3 px-6 text-lg text-white hover:bg-primary hover:text-white w-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                clip-rule="evenodd"
              />
            </svg>
            <span v-if="!isCollapsed" class="ml-3">Logout</span>
          </button>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 overflow-y-hidden">
        <header
          v-if="isLoggedIn && !isLoginPage"
          class="toolbar-gradient shadow-sm"
        >
          <div
            class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center"
          >
            <div>
              <h1 class="text-2xl font-bold text-white">Home</h1>
              <p class="text-gray-300">
                Welcome, {{ isAdminUser ? "Admin" : "User" }} {{ username }}
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <SearchBar v-model:searchQuery="searchQuery" />
              <!-- Dark mode toggle button -->
              <button @click="toggleDarkMode" class="btn-menu-transparent">
                <svg
                  v-if="isDarkMode"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div v-if="isAdminUser && !isLoginPage" class="mb-4 flex justify-end">
            <button
              @click="showUploadModal = true"
              class="btn btn-primary btn-sm flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              Upload Video
            </button>
          </div>
          <router-view
            :searchQuery="searchQuery"
            :selectedTag="selectedTag"
            @clearTagFilter="clearTagFilter"
          ></router-view>
        </main>
      </div>

      <!-- Upload Modal (for admin) -->
      <UploadModal
        v-if="showUploadModal"
        @close="showUploadModal = false"
        @videoUploaded="handleVideoUploaded"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import UploadModal from "@/components/UploadModal.vue";
import eventBus from "@/eventBus";
import axios from "axios";
import SearchBar from "@/components/SearchBar.vue";

export default defineComponent({
  name: "App",
  components: {
    UploadModal,
    SearchBar,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const searchQuery = ref("");
    const showUploadModal = ref(false);
    const isDarkMode = ref(
      localStorage.getItem("darkMode") === "true" || false
    );
    const userRole = ref(localStorage.getItem("userRole"));
    const username = ref(localStorage.getItem("username") || "User");
    const videos = ref<any[]>([]);
    const uniqueTags = ref<string[]>([]);
    const selectedTag = ref<string | null>(null);
    const isCollapsed = ref(false);

    const isLoggedIn = computed(() => {
      return !!userRole.value;
    });

    const isAdminUser = computed(() => {
      return userRole.value === "admin";
    });

    const isLoginPage = computed(() => {
      return route.name === "Login";
    });

    const logout = () => {
      localStorage.removeItem("userRole");
      localStorage.removeItem("username");
      window.dispatchEvent(
        new CustomEvent("userRole-changed", {
          detail: { userRole: null, username: null },
        })
      );
      router.push("/login");
    };

    const handleVideoUploaded = () => {
      console.log("Video uploaded, emitting event...");
      eventBus.$emit("video-uploaded");
      fetchVideos();
      fetchTags();
    };

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value;
      localStorage.setItem("darkMode", isDarkMode.value.toString());
      window.dispatchEvent(
        new CustomEvent("darkMode-changed", {
          detail: { isDarkMode: isDarkMode.value },
        })
      );
      if (isDarkMode.value) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    const handleUserRoleChange = (event: CustomEvent) => {
      userRole.value = event.detail.userRole;
      username.value = event.detail.username || "User";
    };

    const handleDarkModeChange = (event: CustomEvent) => {
      isDarkMode.value = event.detail.isDarkMode;
      if (isDarkMode.value) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://localhost:3000/videos");
        videos.value = response.data;
      } catch (error) {
        console.error("Errore nel recupero dei video:", error);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await axios.get("http://localhost:3000/tags");
        uniqueTags.value = response.data;
      } catch (error) {
        console.error("Errore nel recupero dei tag:", error);
      }
    };

    const toggleTagFilter = (tag: string) => {
      if (selectedTag.value === tag) {
        selectedTag.value = null;
      } else {
        selectedTag.value = tag;
      }
    };

    const clearTagFilter = () => {
      selectedTag.value = null;
    };

    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    onMounted(() => {
      window.addEventListener(
        "userRole-changed",
        handleUserRoleChange as EventListener
      );
      window.addEventListener(
        "darkMode-changed",
        handleDarkModeChange as EventListener
      );
      if (isDarkMode.value) {
        document.documentElement.classList.add("dark");
      }
      fetchVideos();
      fetchTags();
      eventBus.$on("video-uploaded", () => {
        fetchVideos();
        fetchTags();
      });
    });

    onUnmounted(() => {
      window.removeEventListener(
        "userRole-changed",
        handleUserRoleChange as EventListener
      );
      window.removeEventListener(
        "darkMode-changed",
        handleDarkModeChange as EventListener
      );
      eventBus.$off("video-uploaded");
    });

    return {
      searchQuery,
      isLoggedIn,
      isAdminUser,
      isLoginPage,
      showUploadModal,
      logout,
      handleVideoUploaded,
      isDarkMode,
      toggleDarkMode,
      username,
      videos,
      uniqueTags,
      selectedTag,
      toggleTagFilter,
      clearTagFilter,
      isCollapsed,
      toggleSidebar,
    };
  },
});
</script>

<style>
/* Stili base per tutti i bottoni */
.btn {
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: background-color 300ms, opacity 300ms;
  cursor: pointer;
}

/* Varianti di colore */
.btn-primary {
  background-color: var(--color-primary, #3490dc);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark, #2779bd);
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: white;
}

.btn-secondary:hover {
  opacity: 0.8;
}

.btn-tertiary {
  background-color: var(--color-tertiary);
  color: white;
}

.btn-tertiary:hover {
  opacity: 0.8;
}

/* Variante di dimensione */
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.sidebar-gradient {
  background: linear-gradient(to bottom, #4a4a4a, #2a2a2a);
}

.toolbar-gradient {
  background: linear-gradient(to bottom right, #2a2a2a 10%, #5a5a5a);
}

/* Stili per i pulsanti e le interazioni */
.tag {
  background-color: var(--color-tertiary);
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-right: 0.25rem;
  margin-bottom: 0.25rem;
  transition-property: background-color;
  transition-duration: 300ms;
}

.tag:hover {
  background-color: rgba(59, 152, 210, 0.8);
}

.tag.selected {
  background-color: #3b98d2; /* Il colore blu che hai indicato */
}

.btn-menu-transparent {
  padding: 0.5rem;
  border-radius: 50%;
  background-color: transparent;
  color: white;
  transition-property: background-color;
  transition-duration: 300ms;
}

.btn-menu-transparent:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Stili per la modalità scura */
.dark .btn-primary {
  background-color: var(--color-primary-dark, #2779bd);
  color: white;
}

.dark .btn-primary:hover {
  background-color: var(--color-primary, #3490dc);
}

/* Resto degli stili ... */
</style>

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

::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background-color: #e7e7e773;
  border: 1px solid #cacaca;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}

::-webkit-scrollbar-thumb {
  background-color: #363636;
}
</style>
