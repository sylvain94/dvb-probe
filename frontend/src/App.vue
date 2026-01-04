<template>
  <div id="app">
    <nav class="navbar">
      <div class="container">
        <h1>DVB Probe</h1>
        <router-link to="/">Probes</router-link>
        <router-link to="/streams">Streams</router-link>
        <router-link to="/analysis">Analysis</router-link>
        <router-link to="/system">System</router-link>
      </div>
    </nav>
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.navbar {
  background: #2c3e50;
  color: white;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.navbar .container {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.navbar h1 {
  margin: 0;
  font-size: 1.5rem;
}

.navbar a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.3s;
}

.navbar a:hover,
.navbar a.router-link-active {
  background: #34495e;
}
</style>


