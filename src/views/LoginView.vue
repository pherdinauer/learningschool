<template>
  <div class="flex flex-col lg:flex-row relative">
    <!-- Sezione sinistra (logo e titolo) -->
    <div class="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-900 dark:to-indigo-900 transition-colors duration-300 min-h-screen">
      <img src="@/assets/logo.png" alt="Logo" class="w-48 h-48 mb-12 object-contain">
      <h1 class="text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white text-center leading-tight max-w-2xl">
        Benvenuto in <br> eXact Academy
      </h1>
    </div>

    <!-- Sezione destra (form di login) -->
    <div class="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white dark:bg-gray-800">
      <div class="w-full max-w-xl space-y-10">
        <h2 class="text-center text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Accedi al tuo account
        </h2>
        <form class="space-y-8" @submit.prevent="login">
          <div class="space-y-6">
            <div>
              <label for="username" class="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <input id="username" name="username" type="text" required 
                class="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-lg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                placeholder="Inserisci il tuo username" v-model="username">
            </div>
            <div>
              <label for="password" class="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input id="password" name="password" type="password" required 
                class="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-lg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                placeholder="Inserisci la tua password" v-model="password">
            </div>
          </div>

          <div>
            <button type="submit" 
              class="w-full flex justify-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300">
              Accedi
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Pulsante Dark Mode -->
    <button @click="toggleDarkMode" 
      class="absolute bottom-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white transition-colors duration-300">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const isDarkMode = ref(false);

    const login = () => {
      let userRole = '';
      if (username.value === 'admin' && password.value === 'adminpassword') {
        userRole = 'admin';
      } else if (username.value === 'user' && password.value === 'userpassword') {
        userRole = 'user';
      } else {
        alert('Invalid credentials');
        return;
      }

      localStorage.setItem('userRole', userRole);
      localStorage.setItem('username', username.value);
      window.dispatchEvent(new CustomEvent('userRole-changed', { detail: { userRole, username: username.value } }));
      router.push('/');
    };

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value;
      document.documentElement.classList.toggle('dark', isDarkMode.value);
    };

    return {
      username,
      password,
      login,
      toggleDarkMode
    };
  }
});
</script>

<style scoped>
/* Puoi aggiungere stili specifici qui se necessario */
</style>