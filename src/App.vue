<template>
  <div :class="{ 'dark': isDarkMode }" class="min-h-screen bg-white dark:bg-gray-800 transition-colors duration-300">
    <div class="flex h-screen">
      <!-- Sidebar (visibile solo se l'utente è loggato e non è nella pagina di login) -->
      <div v-if="isLoggedIn && !isLoginPage" class="w-64 bg-white dark:bg-gray-900 shadow-md flex flex-col">
        <div class="p-4">
          <img src="..//src/assets/logo.png" alt="Logo" class="w-32 mx-auto">
        </div>
        <nav class="flex-grow">
          <router-link to="/" class="block py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Home</router-link>
          <router-link to="/favorites" class="block py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Favorites</router-link>
          <button v-if="isAdminUser" @click="showUploadModal = true" class="block w-full text-left py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Upload Video</button>
        </nav>
        <button @click="logout" class="block w-full text-left py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 mt-auto">Logout</button>
      </div>

      <!-- Main content -->
      <div class="flex-1 overflow-y-auto">
        <header class="bg-white dark:bg-gray-900 shadow-sm flex justify-between items-center">
          <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex-grow">
            <input v-if="isLoggedIn && !isLoginPage" type="text" v-model="searchQuery" placeholder="Search videos..." class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600">
          </div>
          <!-- Dark mode toggle button -->
          <button @click="toggleDarkMode" class="p-2 mr-4 rounded-full bg-gray-200 dark:bg-gray-600">
            <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </header>

        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <router-view :searchQuery="searchQuery"></router-view>
        </main>
      </div>

      <!-- Upload Modal (for admin) -->
      <UploadModal v-if="showUploadModal" @close="showUploadModal = false" @videoUploaded="onVideoUploaded" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import UploadModal from '@/components/UploadModal.vue';

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

    const isLoggedIn = computed(() => {
      return !!localStorage.getItem('userRole');
    });

    const isAdminUser = computed(() => {
      return localStorage.getItem('userRole') === 'admin';
    });

    const isLoginPage = computed(() => {
      return route.name === 'Login';
    });

    const logout = () => {
      localStorage.removeItem('userRole');
      router.push('/login');
    };

    const onVideoUploaded = () => {
      showUploadModal.value = false;
      if (router.currentRoute.value.name === 'Home') {
        router.go(0);
      }
    };

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value;
      localStorage.setItem('darkMode', isDarkMode.value.toString());
    };

    watch(isDarkMode, (newValue) => {
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, { immediate: true });

    return { 
      searchQuery, 
      isLoggedIn,
      isAdminUser,
      isLoginPage,
      showUploadModal, 
      logout,
      onVideoUploaded,
      isDarkMode,
      toggleDarkMode
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