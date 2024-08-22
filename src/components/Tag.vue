<template>
    <div>
      <div class="mb-4">
        <input v-model="newTag" @keyup.enter="addTag" placeholder="Aggiungi un tag" class="w-full p-2 border rounded">
        <button @click="addTag" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Aggiungi Tag</button>
      </div>
      <div class="flex flex-wrap">
        <span v-for="tag in tags" :key="tag" class="bg-gray-200 px-2 py-1 rounded mr-2 mb-2">
          {{ tag }}
          <button @click="removeTag(tag)" class="ml-1 text-red-500">&times;</button>
        </span>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  
  export default defineComponent({
    name: 'Tag',
    props: {
      initialTags: {
        type: Array as () => string[],
        default: () => []
      }
    },
    emits: ['update:tags'],
    setup(props, { emit }) {
      const tags = ref<string[]>(props.initialTags);
      const newTag = ref('');
  
      const addTag = () => {
        if (newTag.value && !tags.value.includes(newTag.value)) {
          tags.value.push(newTag.value);
          newTag.value = '';
          emit('update:tags', tags.value);
        }
      };
  
      const removeTag = (tagToRemove: string) => {
        tags.value = tags.value.filter(tag => tag !== tagToRemove);
        emit('update:tags', tags.value);
      };
  
      return {
        tags,
        newTag,
        addTag,
        removeTag
      };
    }
  });
  </script>