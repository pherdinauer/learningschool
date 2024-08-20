<template>
    <div class="login-container">
      <h2>Login Amministratore</h2>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit">Accedi</button>
      </form>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default defineComponent({
    name: 'LoginView',
    setup() {
      const username = ref('');
      const password = ref('');
      const router = useRouter();
  
      const login = () => {
        // Qui dovresti implementare una vera autenticazione
        if (username.value === 'admin' && password.value === 'password') {
          localStorage.setItem('isAdmin', 'true');
          router.push('/admin');
        } else {
          alert('Credenziali non valide');
        }
      };
  
      return { username, password, login };
    }
  });
  </script>
  
  <style scoped>
  .login-container {
    max-width: 300px;
    margin: 50px auto;
    padding: 20px;
    background-color: var(--primary-color);
    border-radius: 8px;
  }
  
  h2 {
    color: var(--secondary-color);
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    color: var(--light-color);
  }
  
  input {
    width: 100%;
    padding: 8px;
    border: none;
    border-radius: 4px;
  }
  
  button {
    width: 100%;
    padding: 10px;
    background-color: var(--secondary-color);
    color: var(--dark-color);
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #5cffff;
  }
  </style>