<template>
  <div :class="{ 'dark': isDarkMode }" class="min-h-screen custom-bg dark:bg-gray-800 transition-colors duration-300">
    <div class="flex h-screen">
      <!-- Sidebar (visibile solo se l'utente è loggato e non è nella pagina di login) -->
      <div v-if="isLoggedIn && !isLoginPage" 
           :class="[
             'custom-beige dark:bg-gray-900 shadow-md flex flex-col transition-all duration-300 ease-in-out',
             isCollapsed ? 'w-16' : 'w-64'
           ]">
        <div class="p-4 mb-6 flex justify-between items-center">
          <img v-if="!isCollapsed" src="@/assets/logo.png" alt="Logo" class="w-32">
          <button @click="toggleSidebar" class="p-2 rounded-full hover:bg-beige-600 dark:hover:bg-gray-700 text-white dark:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <nav class="space-y-2">
          <router-link to="/" class="flex items-center py-3 px-6 text-lg text-white dark:text-gray-300 hover:bg-beige-600 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span v-if="!isCollapsed" class="ml-3">Home</span>
          </router-link>
          <router-link to="/favorites" class="flex items-center py-3 px-6 text-lg text-white dark:text-gray-300 hover:bg-beige-600 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span v-if="!isCollapsed" class="ml-3">Favorites</span>
          </router-link>
          <router-link v-if="isAdminUser" to="/video-management" class="flex items-center py-3 px-6 text-lg text-white dark:text-gray-300 hover:bg-beige-600 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <span v-if="!isCollapsed" class="ml-3">Manage Videos</span>
          </router-link>
          
          <!-- Sezione Tag (visibile solo quando il menu è espanso) -->
          <div v-if="!isCollapsed" class="py-3 px-6">
            <h2 class="text-lg font-semibold mb-2 text-white dark:text-gray-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
              </svg>
              Tag
            </h2>
            <div class="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              <button 
                v-for="tag in uniqueTags" 
                :key="tag" 
                @click="toggleTagFilter(tag)"
                class="w-full text-left flex justify-between items-center py-2 px-3 rounded transition-colors duration-200 text-white dark:text-gray-300 hover:bg-beige-600 dark:hover:bg-gray-700"
                :class="{
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': selectedTag === tag
                }"
              >
                <span>{{ tag }}</span>
                <span v-if="selectedTag === tag" class="text-xs ml-2">&times;</span>
              </button>
            </div>
          </div>
        </nav>

        <div class="mt-auto">
          <button @click="logout" class="flex items-center py-3 px-6 text-lg text-white dark:text-gray-300 hover:bg-beige-600 dark:hover:bg-gray-700 w-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
            </svg>
            <span v-if="!isCollapsed" class="ml-3">Logout</span>
          </button>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 overflow-y-auto">
        <header v-if="isLoggedIn && !isLoginPage" class="custom-beige dark:bg-gray-900 shadow-sm">
          <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-white dark:text-white">Home</h1>
              <p class="text-gray-200 dark:text-gray-300">
                Welcome, {{ isAdminUser ? 'Admin' : 'User' }} {{ username }}
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <input type="text" v-model="searchQuery" placeholder="Search videos..." class="px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white dark:border-gray-600 w-64">
              <!-- Dark mode toggle button -->
              <button @click="toggleDarkMode" class="p-2 rounded-full bg-beige-600 dark:bg-gray-600 text-white dark:text-gray-300">
                <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div v-if="isAdminUser" class="mb-4 flex justify-end">
            <button @click="showUploadModal = true" class="custom-button hover:opacity-90 text-white font-bold py-2 px-4 rounded flex items-center transition-opacity duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              Upload Video
            </button>
          </div>
          <router-view :searchQuery="searchQuery" :selectedTag="selectedTag" @clearTagFilter="clearTagFilter"></router-view>
        </main>
      </div>

      <!-- Upload Modal (for admin) -->
      <UploadModal v-if="showUploadModal" @close="showUploadModal = false" @videoUploaded="handleVideoUploaded" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import UploadModal from '@/components/UploadModal.vue';
import eventBus from '@/eventBus';
import axios from 'axios';

export default defineComponent({
  name: 'App',
  components: {
    UploadModal
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const searchQuery = ref('');
    const showUploadModal = ref(false);
    const isDarkMode = ref(localStorage.getItem('darkMode') === 'true');
    const userRole = ref(localStorage.getItem('userRole'));
    const username = ref(localStorage.getItem('username') || 'User');
    const videos = ref<any[]>([]);
    const uniqueTags = ref<string[]>([]);
    const selectedTag = ref<string | null>(null);
    const isCollapsed = ref(false);

    const isLoggedIn = computed(() => {
      return !!userRole.value;
    });

    const isAdminUser = computed(() => {
      return userRole.value === 'admin';
    });

    const isLoginPage = computed(() => {
      return route.name === 'Login';
    });

    const logout = () => {
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      window.dispatchEvent(new CustomEvent('userRole-changed', { detail: { userRole: null, username: null } }));
      router.push('/login');
    };

    const handleVideoUploaded = () => {
      console.log('Video uploaded, emitting event...');
      eventBus.$emit('video-uploaded');
      fetchVideos();
      fetchTags();
    };

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value;
      localStorage.setItem('darkMode', isDarkMode.value.toString());
      window.dispatchEvent(new CustomEvent('darkMode-changed', { detail: { isDarkMode: isDarkMode.value } }));
    };

    const handleUserRoleChange = (event: CustomEvent) => {
      userRole.value = event.detail.userRole;
      username.value = event.detail.username || 'User';
    };

    const handleDarkModeChange = (event: CustomEvent) => {
      isDarkMode.value = event.detail.isDarkMode;
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/videos');
        videos.value = response.data;
      } catch (error) {
        console.error('Errore nel recupero dei video:', error);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:3000/tags');
        uniqueTags.value = response.data;
      } catch (error) {
        console.error('Errore nel recupero dei tag:', error);
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
      window.addEventListener('userRole-changed', handleUserRoleChange as EventListener);
      window.addEventListener('darkMode-changed', handleDarkModeChange as EventListener);
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark');
      }
      fetchVideos();
      fetchTags();
      eventBus.$on('video-uploaded', () => {
        fetchVideos();
        fetchTags();
      });
    });

    onUnmounted(() => {
      window.removeEventListener('userRole-changed', handleUserRoleChange as EventListener);
      window.removeEventListener('darkMode-changed', handleDarkModeChange as EventListener);
      eventBus.$off('video-uploaded');
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
      toggleSidebar
    };
  }
});
</script>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Puoi aggiungere stili globali qui se necessario */
</style>

<style scoped>
.custom-beige {
  background-color: #b2a088;
}

.custom-bg {
  background-color: #9CA3AF;
}

.custom-card {
  background-color: #3e4756;
}

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

.custom-button {
  background-color: #3e4756;
}
</style>