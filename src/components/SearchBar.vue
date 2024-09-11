<template>
  <div class="relative w-96 searchInputContainer">
    <input
      type="text"
      v-model="localSearchQuery"
      @input="updateSearchQuery"
      @keyup.enter="handleSearch"
      class="w-full py-2 px-4 pr-20 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
      placeholder="Cerca tra i video o chiedi all'IA"
    />
    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
      <button
        @click="handleSearch"
        class="p-1 focus:outline-none focus:shadow-outline"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      <button
        @click="askAI"
        class="ai-button ml-2 px-2 py-1 rounded-md focus:outline-none focus:shadow-outline ai-button"
        :class="{ 'ai-button-active': isAIActive }"
      >
        IA
      </button>
    </div>

    <!-- AI Response Box -->
    <div v-if="showAIResponse" class="ai-response-box">
      <button @click="closeAIResponse" class="close-button">&times;</button>
      <h3 class="response-title">Risposta dell'IA</h3>
      <div class="response-content" v-html="formattedAIResponse"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";

export default defineComponent({
  name: "SearchBar",
  props: {
    searchQuery: {
      type: String,
      required: true,
    },
  },
  emits: ["update:searchQuery", "search"],
  setup(props, { emit }) {
    const localSearchQuery = ref(props.searchQuery);
    const showAIResponse = ref(false);
    const aiResponse = ref("");
    const isTyping = ref(false);
    const isAIActive = ref(false);

    const updateSearchQuery = () => {
      emit("update:searchQuery", localSearchQuery.value);
    };

    const handleSearch = () => {
      emit("search", localSearchQuery.value);
    };

    const askAI = () => {
      isAIActive.value = true;
      showAIResponse.value = true;
      isTyping.value = true;
      aiResponse.value = "";

      const response = `Mi dispiace, purtroppo non è presente un video tutorial a riguardo; tuttavia cercherò di fornirti una risposta esaustiva!

Per modificare i parametri di sistema dell'LCMS, segui questi passaggi:

1. Effettua il Login con un account Amministratore.

2. Dopo il Login, clicca su "Administration" in basso a sinistra.

3. Una volta nel pannello di amministrazione, seleziona la tab "Impostazioni di Sistema".

4. Da qui dovresti riuscire a modificare le impostazioni di sistema.

Spero che queste istruzioni ti siano d'aiuto. Se hai bisogno di ulteriori chiarimenti, non esitare a chiedere!`;

      let i = 0;
      const intervalId = setInterval(() => {
        if (i < response.length) {
          aiResponse.value += response[i];
          i++;
        } else {
          clearInterval(intervalId);
          isTyping.value = false;
          setTimeout(() => {
            isAIActive.value = false;
          }, 300);
        }
      }, 30);
    };

    const closeAIResponse = () => {
      showAIResponse.value = false;
      aiResponse.value = "";
    };

    const formattedAIResponse = computed(() => {
      if (isTyping.value) {
        return aiResponse.value.replace(/\n/g, "<br>");
      } else {
        return (
          aiResponse.value.replace(/\n/g, "<br>") +
          '<span class="cursor">|</span>'
        );
      }
    });

    return {
      localSearchQuery,
      updateSearchQuery,
      handleSearch,
      askAI,
      showAIResponse,
      aiResponse,
      isTyping,
      closeAIResponse,
      isAIActive,
      formattedAIResponse,
    };
  },
});
</script>

<style scoped>
.ai-button {
  background: linear-gradient(145deg, #3490dc, #2779bd);
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
}

.ai-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.ai-button:active,
.ai-button-active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(50, 50, 93, 0.1), 0 1px 2px rgba(0, 0, 0, 0.08);
}

.ai-response-box {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 90%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  z-index: 1000;
  transition: all 0.3s ease;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: rgba(0, 0, 0, 0.8);
}

.response-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1a202c;
  margin-bottom: 0.75rem;
}

.response-content {
  color: #4a5568;
  line-height: 1.6;
  white-space: pre-line;
}

.cursor {
  animation: blink 0.7s infinite;
}

@keyframes blink {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* Stili per la modalità dark */
:global(.dark) .ai-response-box {
  background: rgba(26, 32, 44, 0.9);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:global(.dark) .close-button {
  color: rgba(255, 255, 255, 0.5);
}

:global(.dark) .close-button:hover {
  color: rgba(255, 255, 255, 0.8);
}

:global(.dark) .response-title {
  color: #e2e8f0;
}

:global(.dark) .response-content {
  color: #a0aec0;
}
</style>
