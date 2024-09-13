<template>
  <div class="playlistCardsWrapper">
    <button class="carousel-button prev" @click="scrollLeft">
      <svg
        version="1.1"
        id="fi_130884"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 240.823 240.823"
        style="transform: rotate(180deg)"
        xml:space="preserve"
      >
        <g>
          <path
            id="Chevron_Right_1_"
            d="M183.189,111.816L74.892,3.555c-4.752-4.74-12.451-4.74-17.215,0c-4.752,4.74-4.752,12.439,0,17.179
		l99.707,99.671l-99.695,99.671c-4.752,4.74-4.752,12.439,0,17.191c4.752,4.74,12.463,4.74,17.215,0l108.297-108.261
		C187.881,124.315,187.881,116.495,183.189,111.816z"
          ></path>
        </g>
      </svg>
    </button>
    <div class="carousel-container">
      <div
        v-for="playlist in playlists"
        :key="playlist.id"
        class="custom-card rounded-lg shadow-md overflow-hidden relative bg-white dark:bg-gray-800 cursor-pointer playlistCard"
        @click="$emit('open-playlist-modal', playlist)"
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

    <button class="carousel-button next" @click="scrollRight">
      <svg
        version="1.1"
        id="fi_130884"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 240.823 240.823"
        style="enable-background: new 0 0 240.823 240.823"
        xml:space="preserve"
      >
        <g>
          <path
            id="Chevron_Right_1_"
            d="M183.189,111.816L74.892,3.555c-4.752-4.74-12.451-4.74-17.215,0c-4.752,4.74-4.752,12.439,0,17.179
		l99.707,99.671l-99.695,99.671c-4.752,4.74-4.752,12.439,0,17.191c4.752,4.74,12.463,4.74,17.215,0l108.297-108.261
		C187.881,124.315,187.881,116.495,183.189,111.816z"
          ></path>
        </g>
      </svg>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import "../assets/cards.scss";

interface Playlist {
  id: string;
  name: string;
  color: number[];
  videos: string[];
}

export default defineComponent({
  name: "PlaylistCards",
  props: {
    playlists: {
      type: Array as PropType<Playlist[]>,
      required: true,
    },
  },
  emits: ["open-playlist-modal"],
  methods: {
    scrollLeft() {
      const container = this.$el.querySelector(".carousel-container");
      const itemWidth = container.querySelector(".playlistCard").offsetWidth;
      container.scrollLeft -= itemWidth;
    },
    scrollRight() {
      const container = this.$el.querySelector(".carousel-container");
      const itemWidth = container.querySelector(".playlistCard").offsetWidth;
      container.scrollLeft += itemWidth;
    },
  },
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.tag {
  background-color: rgba(37, 99, 235, 0.15);
  color: #1e40af;
  font-size: 0.6rem;
  padding: 0.1rem 0.3rem;
  border-radius: 9999px;
  font-weight: 600;
}

/* Stili aggiornati per aumentare il contrasto in modalità chiara */
.bg-gray-100 {
  background-color: #f1f5f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.text-gray-900 {
  color: #0f172a;
}

.text-gray-600 {
  color: #334155;
}

.bg-gray-200 {
  background-color: #cbd5e1;
}

.bg-blue-600 {
  background-color: #2563eb;
}

/* Stile per il bordo della card */
.border-gray-300 {
  border-color: #94a3b8;
}

/* Stile per l'hover della card */
.bg-gray-100:hover {
  background-color: #e2e8f0;
  transition: background-color 0.3s ease;
}

/* Manteniamo gli stili per la modalità scura */
:global(.dark) .bg-gray-700 {
  background-color: #1e293b;
}

:global(.dark) .border-gray-600 {
  border-color: #475569;
}

:global(.dark) .text-white {
  color: #f8fafc;
}

:global(.dark) .text-gray-300 {
  color: #cbd5e1;
}

:global(.dark) .tag {
  background-color: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

:global(.dark) .bg-gray-700 {
  background-color: #334155;
}
</style>
