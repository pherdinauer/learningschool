<template>
  <div
    :class="{ dark: isDarkMode }"
    class="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300"
  >
    <div class="flex h-screen">
      <div class="flex-1 overflow-y-hidden">
        <!-- Top bar  -->
        <div
          v-if="isLoggedIn && !isLoginPage"
          class="toolbar-gradient shadow-sm top-bar"
        >
          <div class="flex items-center topBarContainer">
            <div class="flex items-center barTopLeft px-2">
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
              <img src="@/assets/logo.png" alt="Logo" class="w-32" />
            </div>
            <div class="flex items-center space-x-4 searchContainer">
              <SearchBar v-model:searchQuery="searchQuery" />
              <!-- Aggiungi il pulsante Upload Video qui -->
              <button
                v-if="isAdminUser"
                @click="showUploadModal = true"
                class="btn btn-primary btn-sm flex items-center uploadButton"
              >
                <svg
                  height="300"
                  viewBox="0 0 32 32"
                  width="300"
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  xmlns:svgjs="http://svgjs.dev/svgjs"
                >
                  <g transform="matrix(1,0,0,1,0,0)">
                    <g id="_05_video_upload" data-name="05 video upload">
                      <path
                        d="m24 16.08v-11.08a3 3 0 0 0 -3-3h-16a3 3 0 0 0 -3 3v16a3 3 0 0 0 3 3h11.08a7 7 0 1 0 7.92-7.92zm-20 4.92v-16a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v11.08a7 7 0 0 0 -5.92 5.92h-11.08a1 1 0 0 1 -1-1zm19 7a5 5 0 1 1 5-5 5 5 0 0 1 -5 5zm-5.55-14.11a1 1 0 0 0 0-1.78l-8-4a1 1 0 0 0 -1.45.89v8a1 1 0 0 0 .47.85 1 1 0 0 0 .53.15 1 1 0 0 0 .45-.11zm-7.45-3.27 4.76 2.38-4.76 2.38zm15.71 11.17a1 1 0 0 1 0 1.42 1 1 0 0 1 -1.42 0l-.29-.3v2.59a1 1 0 0 1 -2 0v-2.59l-.29.3a1 1 0 0 1 -1.42-1.42l2-2a1 1 0 0 1 1.42 0z"
                        fill="#000000ff"
                        data-original-color="#000000ff"
                        stroke="none"
                      />
                    </g>
                  </g>
                </svg>

                Upload
              </button>
            </div>
            <div class="flex justify-around items-center barTopRight">
              <div class="avatarContainer" @click="toggleAvatarDropdown">
                <img src="./assets/avatar.png" class="avatar" alt="Avatar" />
                <div v-show="avatarDropdown" class="avatar-dropdown-content">
                  <p>
                    Welcome, <br />{{ isAdminUser ? "Admin" : "User" }}
                    {{ "Valerio" }}
                  </p>
                  <!-- Dark mode toggle button -->
                  <button
                    @click="toggleDarkMode"
                    class="flex items-center text-white hover:bg-primary hover:text-white w-full darkModeToggle"
                  >
                    <svg
                      v-if="isDarkMode"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
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
                      class="h-5 w-5"
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
                    <span v-if="isDarkMode">Light Mode</span>
                    <span v-else>Dark Mode</span>
                  </button>
                  <!-- Logout button -->
                  <button
                    @click="logout"
                    class="flex items-center text-white hover:bg-primary hover:text-white w-full logoutButton"
                  >
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      class="h-5 w-5"
                      viewBox="0 0 471.2 471.2"
                      xml:space="preserve"
                    >
                      <g>
                        <g>
                          <path
                            d="M227.619,444.2h-122.9c-33.4,0-60.5-27.2-60.5-60.5V87.5c0-33.4,27.2-60.5,60.5-60.5h124.9c7.5,0,13.5-6,13.5-13.5
			s-6-13.5-13.5-13.5h-124.9c-48.3,0-87.5,39.3-87.5,87.5v296.2c0,48.3,39.3,87.5,87.5,87.5h122.9c7.5,0,13.5-6,13.5-13.5
			S235.019,444.2,227.619,444.2z"
                          ></path>
                          <path
                            d="M450.019,226.1l-85.8-85.8c-5.3-5.3-13.8-5.3-19.1,0c-5.3,5.3-5.3,13.8,0,19.1l62.8,62.8h-273.9c-7.5,0-13.5,6-13.5,13.5
			s6,13.5,13.5,13.5h273.9l-62.8,62.8c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4l85.8-85.8
			C455.319,239.9,455.319,231.3,450.019,226.1z"
                          ></path>
                        </g>
                      </g>
                      <g></g>
                      <g></g>
                      <g></g>
                      <g></g>
                      <g></g>
                      <g></g>
                      <g></g>
                      <g></g>
                      <g></g>
                      <g></g>
                      <g></g>
                      <g></g>
                      <g></g>
                      <g></g>
                      <g></g>
                    </svg>
                    <span v-if="!isCollapsed" class="ml-3">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Sidebar (visibile solo se l'utente è loggato e non è nella pagina di login) -->
        <div
          v-if="isLoggedIn && !isLoginPage"
          :class="[
            'sidebar-gradient shadow-md flex flex-col transition-all duration-300 ease-in-out sidebar',
            isCollapsed ? 'w-16' : 'w-64',
          ]"
        >
          <nav class="space-y-2">
            <router-link
              to="/"
              :class="[
                'flex items-center py-3 px-4 text-lg text-white hover:bg-primary hover:text-white',
                { selected: route.path === '/' },
              ]"
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
              :class="[
                'flex items-center py-3 px-4 text-lg text-white hover:bg-primary hover:text-white',
                { selected: route.path === '/favorites' },
              ]"
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
              :class="[
                'flex items-center py-3 px-4 text-lg text-white hover:bg-primary hover:text-white',
                { selected: route.path === '/playlists' },
              ]"
            >
              <svg
                id="fi_4043797"
                viewBox="0 0 512 512"
                class="h-6 w-6 playlistIcon"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path
                  d="m280.593 449.83a16 16 0 0 1 -16 16h-248.593a16 16 0 0 1 0-32h248.593a16 16 0 0 1 16 16zm-16-151.538h-248.593a16 16 0 0 0 0 32h248.593a16 16 0 0 0 0-32zm-248.593-239.076h480a16 16 0 0 0 0-32h-480a16 16 0 0 0 0 32zm496 322.845a16 16 0 0 1 -7.773 13.723l-144.673 86.724a16 16 0 0 1 -24.226-13.724v-173.447a16 16 0 0 1 24.226-13.724l144.672 86.724a16 16 0 0 1 7.774 13.724zm-47.12 0-97.552-58.478v116.956zm31.12-219.307h-480a16 16 0 0 0 0 32h480a16 16 0 0 0 0-32z"
                ></path>
              </svg>
              <span v-if="!isCollapsed" class="ml-3">Playlist</span>
            </router-link>
            <router-link
              v-if="isAdminUser"
              to="/video-management"
              :class="[
                'flex items-center py-3 px-4 text-lg text-white hover:bg-primary hover:text-white',
                { selected: route.path === '/video-management' },
              ]"
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
          </nav>
        </div>
        <!-- Main content -->
        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mainContent">
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
      <div class="accessibilityButtonContainer">
        <!-- Compliance ADA options -->
        <button class="accessibilityButton" @click="toggleAccessibilityModal">
          <svg
            id="Capa_1"
            enable-background="new 0 0 512 512"
            height="512"
            viewBox="0 0 512 512"
            width="512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path
                d="m437.02 74.98c-48.353-48.351-112.64-74.98-181.02-74.98s-132.667 26.629-181.02 74.98c-48.351 48.353-74.98 112.64-74.98 181.02s26.629 132.667 74.98 181.02c48.353 48.351 112.64 74.98 181.02 74.98s132.667-26.629 181.02-74.98c48.351-48.353 74.98-112.64 74.98-181.02s-26.629-132.667-74.98-181.02zm-21.214 340.826c-42.686 42.686-99.439 66.194-159.806 66.194s-117.12-23.508-159.806-66.194-66.194-99.439-66.194-159.806 23.508-117.12 66.194-159.806 99.439-66.194 159.806-66.194 117.12 23.508 159.806 66.194 66.194 99.439 66.194 159.806-23.508 117.12-66.194 159.806z"
              />
              <path
                d="m319.039 123.038c0-34.76-28.279-63.038-63.039-63.038s-63.039 28.278-63.039 63.038c0 12.108 3.439 23.425 9.38 33.039h-96.341v90h83.039v40.98l-65.49 113.433 77.942 45 54.509-94.413 54.51 94.413 77.942-45-65.49-113.433v-40.98h83.038v-90h-96.342c5.942-9.614 9.381-20.931 9.381-33.039zm-96.078 0c0-18.217 14.821-33.038 33.039-33.038s33.039 14.821 33.039 33.038c0 18.218-14.821 33.039-33.039 33.039s-33.039-14.821-33.039-33.039zm153.039 93.039h-83.039v79.02l54.51 94.413-25.981 15-65.49-113.433-65.49 113.433-25.981-15 54.51-94.413v-79.02h-83.039v-30h240z"
              />
            </g>
          </svg>
        </button>
      </div>

      <!-- Accessibility Modal -->
      <AccessibilityModal
        v-if="showAccessibilityModal"
        @close="showAccessibilityModal = false"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import UploadModal from "@/components/UploadModal.vue";
import AccessibilityModal from "@/components/AccessibilityModal.vue";
import eventBus from "@/eventBus";
import axios from "axios";
import SearchBar from "@/components/SearchBar.vue";
import "./assets/modal.scss";
import "./assets/main.scss";
import "./assets/accessibility.scss";

export default defineComponent({
  name: "App",
  components: {
    UploadModal,
    AccessibilityModal,
    SearchBar,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const searchQuery = ref("");
    const showUploadModal = ref(false);
    const showAccessibilityModal = ref(false);
    const isDarkMode = ref(
      localStorage.getItem("darkMode") === "true" || false
    );
    const userRole = ref(localStorage.getItem("userRole"));
    const username = ref(localStorage.getItem("username") || "User");
    const videos = ref<any[]>([]);
    const uniqueTags = ref<string[]>([]);
    const selectedTag = ref<string | null>(null);
    const isCollapsed = ref(false);
    const avatarDropdown = ref(false);
    const isTagListCollapsed = ref(false);

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

    const toggleAccessibilityModal = () => {
      showAccessibilityModal.value = !showAccessibilityModal.value;
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
    const toggleAvatarDropdown = () => {
      avatarDropdown.value = !avatarDropdown.value;
    };

    const toggleTagList = () => {
      isTagListCollapsed.value = !isTagListCollapsed.value;
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
      isTagListCollapsed,
      toggleTagList,
      toggleSidebar,
      toggleAvatarDropdown,
      avatarDropdown,
      route,
      showAccessibilityModal,
      toggleAccessibilityModal,
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
