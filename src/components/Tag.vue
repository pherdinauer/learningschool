<template>
    <div>
      <div class="mb-4 flex items-center space-x-2">
        <input 
          v-model="newTag" 
          @keyup.enter="addTag" 
          placeholder="Aggiungi un tag" 
          class="flex-grow p-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
        >
        <button @click="addTag" class="btn-primary btn-sm">
          Aggiungi Tag
        </button>
      </div>
      <div class="flex flex-wrap">
        <span 
          v-for="tag in tags" 
          :key="tag" 
          :class="['tag flex items-center', { 'selected': isSelected(tag) }]"
        >
          {{ tag }}
          <button
            @click="removeTag(tag)"
            class="ml-1 text-xs font-bold hover:text-red-500 transition-colors duration-300"
            aria-label="Rimuovi tag"
          >
            &times;
          </button>
        </span>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch, computed } from 'vue';
  
  export default defineComponent({
    name: 'Tag',
    props: {
      modelValue: {
        type: Array as () => string[],
        default: () => []
      },
      selectedTag: {
        type: String,
        default: null
      }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const tags = ref<string[]>(props.modelValue);
      const newTag = ref('');

      const addTag = () => {
        if (newTag.value && !tags.value.includes(newTag.value)) {
          tags.value.push(newTag.value);
          newTag.value = '';
          emit('update:modelValue', tags.value);
        }
      };

      const removeTag = (tagToRemove: string) => {
        tags.value = tags.value.filter(tag => tag !== tagToRemove);
        emit('update:modelValue', tags.value);
      };

      const isSelected = computed(() => (tag: string) => tag === props.selectedTag);

      watch(() => props.modelValue, (newValue) => {
        tags.value = newValue;
      });

      return {
        tags,
        newTag,
        addTag,
        removeTag,
        isSelected
      };
    }
  });
  </script>