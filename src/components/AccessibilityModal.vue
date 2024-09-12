<template>
  <div class="accessibilityModal">
    <h1>Accessibility options</h1>
    <button @click="toggleContrast">Alto contrasto</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "AccessibilityModal",

  setup(props, { emit }) {
    const toggleContrast = () => {
      document.body.classList.toggle("high-contrast");
    };

    return {
      toggleContrast,
    };
  },
});
</script>
