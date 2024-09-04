<template>
  <div class="search-bar flex flex-col items-center">
    <div class="flex items-center w-full">
      <input 
        type="text" 
        v-model="localSearchQuery"
        @input="emitSearch"
        placeholder="Cerca video..."
        class="flex-grow px-4 py-2 rounded-l-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
      <button 
        @click="askAI"
        class="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        AI
      </button>
    </div>
    <div v-if="showAIResponse" class="mt-4 p-4 bg-white dark:bg-gray-800 rounded-md shadow-md w-full max-w-2xl relative">
      <button 
        @click="closeAIResponse" 
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Risposta AI:</h3>
      <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ aiResponse }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'SearchBar',
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  emits: ['update:searchQuery'],
  setup(props, { emit }) {
    const localSearchQuery = ref(props.searchQuery);
    const showAIResponse = ref(false);
    const aiResponse = ref('');

    watch(() => props.searchQuery, (newValue) => {
      localSearchQuery.value = newValue;
    });

    const emitSearch = () => {
      emit('update:searchQuery', localSearchQuery.value);
    };

    const askAI = () => {
      if (!localSearchQuery.value) return;

      // Mock della risposta AI
      if (localSearchQuery.value.toLowerCase().includes('come modificare i parametri di sistema dell\'lcms')) {
        aiResponse.value = "Purtroppo non esiste ancora un tutorial a riguardo, tuttavia proverò a fornirti una risposta valida.\n\nPer cambiare i parametri di sistema devi effettuare l'accesso con un account amministratore. Successivamente devi cliccare su Administration e su System Parameters.\n\nIn questa schermata avrai accesso ai parametri di sistema di LCMS.";
      } else {
        aiResponse.value = "Mi dispiace, non ho informazioni specifiche su questa richiesta. Posso aiutarti con qualcos'altro?";
      }
      showAIResponse.value = true;
    };

    const closeAIResponse = () => {
      showAIResponse.value = false;
      aiResponse.value = '';
      localSearchQuery.value = '';
      emit('update:searchQuery', '');
    };

    return {
      localSearchQuery,
      emitSearch,
      askAI,
      showAIResponse,
      aiResponse,
      closeAIResponse
    };
  }
});
</script>

<style scoped>
.search-bar {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
</style>
