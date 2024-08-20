<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<style>
:root {
  --primary-color: #215D85;
  --secondary-color: #3B98D2;
  --dark-color: #424242;
  --light-color: #CFD8DC;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: var(--dark-color);
  color: var(--light-color);
  margin: 0;
  padding: 0;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>