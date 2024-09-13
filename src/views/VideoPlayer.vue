<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white dark:bg-gray-800 p-4 rounded-lg w-[90vw] h-[90vh] flex flex-col"
    >
      <div class="top-modal">
        <h2 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {{ videoTitle }}
        </h2>
        <button
          @click="closeModal"
          class="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white close-button"
          aria-label="Chiudi video"
        >
          <svg
            class="w-10 h-10 close-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <div class="flex-grow flex flex-col overflow-hidden">
        <div
          ref="videoContainer"
          class="video-player mb-2 flex-grow relative"
          style="height: 85%"
        >
          <video
            ref="videoRef"
            :src="videoUrl"
            @timeupdate="onTimeUpdate"
            @ended="onEnded"
            @loadedmetadata="onVideoLoaded"
            class="w-full h-full object-contain"
            controls
          ></video>
        </div>
        <div
          class="transcript-container overflow-y-auto border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2"
          style="height: 15%"
        >
          <h3 class="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
            Transcript
          </h3>
          <p class="transcript-text text-gray-700 dark:text-gray-300 text-sm">
            {{ transcript }}
          </p>
        </div>
      </div>
      <div class="flex justify-end mt-2">
        <button
          @click="$emit('close')"
          class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded closeBtn"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from "vue";

export default defineComponent({
  name: "VideoPlayer",
  props: {
    videoUrl: {
      type: String,
      required: true,
    },
    videoTitle: {
      type: String,
      required: true,
    },
    transcript: {
      type: String,
      required: true,
    },
    currentTime: {
      type: Number,
      default: 0,
    },
    isPlaying: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["close", "timeUpdate", "togglePlayPause", "ended"],
  setup(props, { emit }) {
    const videoRef = ref<HTMLVideoElement | null>(null);
    const videoContainer = ref<HTMLDivElement | null>(null);

    const onTimeUpdate = () => {
      if (videoRef.value) {
        emit("timeUpdate", videoRef.value.currentTime);
      }
    };

    const onEnded = () => {
      emit("ended");
    };

    const closeModal = () => {
      emit("close");
    };

    const resizeVideo = () => {
      if (videoRef.value && videoContainer.value) {
        const containerWidth = videoContainer.value.clientWidth;
        const containerHeight = videoContainer.value.clientHeight;
        const videoAspectRatio =
          videoRef.value.videoWidth / videoRef.value.videoHeight;
        const containerAspectRatio = containerWidth / containerHeight;

        if (videoAspectRatio > containerAspectRatio) {
          videoRef.value.style.width = "100%";
          videoRef.value.style.height = "auto";
        } else {
          videoRef.value.style.width = "auto";
          videoRef.value.style.height = "100%";
        }
      }
    };

    const onVideoLoaded = () => {
      resizeVideo();
    };

    onMounted(() => {
      window.addEventListener("resize", resizeVideo);
      if (videoRef.value) {
        videoRef.value.currentTime = props.currentTime;
        if (props.isPlaying) {
          videoRef.value.play();
        }
      }
    });

    onUnmounted(() => {
      window.removeEventListener("resize", resizeVideo);
    });

    return {
      videoRef,
      videoContainer,
      closeModal,
      onTimeUpdate,
      onEnded,
      onVideoLoaded,
    };
  },
});
</script>

<style scoped>
.video-player {
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-player video {
  max-width: 100%;
  max-height: 100%;
}

.video-player video::-webkit-media-controls-fullscreen-button {
  display: none;
}

.transcript-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.transcript-container::-webkit-scrollbar {
  width: 6px;
}

.transcript-container::-webkit-scrollbar-track {
  background: transparent;
}

.transcript-container::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
  border: transparent;
}

.transcript-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style>
