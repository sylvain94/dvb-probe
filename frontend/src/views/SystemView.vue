<template>
  <div>
    <h2>System</h2>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="card" v-if="info">
      <h3>System information</h3>
      <p><strong>Platform:</strong> {{ info.platform }}</p>
      <p><strong>Architecture:</strong> {{ info.arch }}</p>
      <p><strong>Node.js version:</strong> {{ info.nodeVersion }}</p>
      <p><strong>Uptime:</strong> {{ formatUptime(info.uptime) }}</p>
      <p><strong>Total memory:</strong> {{ formatBytes(info.memory.total) }}</p>
      <p><strong>Free memory:</strong> {{ formatBytes(info.memory.free) }}</p>
      <p><strong>CPU:</strong> {{ info.cpu }} cores</p>
    </div>

    <div class="card" v-if="health">
      <h3>System health</h3>
      <p><strong>Statut:</strong> {{ health.status }}</p>
      <p><strong>Probes total:</strong> {{ health.probes.total }}</p>
      <p><strong>Probes running:</strong> {{ health.probes.running }}</p>
      <p><strong>Probes stopped:</strong> {{ health.probes.stopped }}</p>
    </div>

    <div class="card" v-if="tsduck">
      <h3>TSDuck</h3>
      <p><strong>Available:</strong> {{ tsduck.available ? 'Yes' : 'No' }}</p>
      <p v-if="tsduck.version"><strong>Version:</strong> {{ tsduck.version }}</p>
      <p><strong>Path:</strong> {{ tsduck.path }}</p>
    </div>
  </div>
</template>

<script>
import api from '../api'
import { onMounted, ref } from 'vue'

export default {
  name: 'SystemView',
  setup() {
    const info = ref(null)
    const health = ref(null)
    const tsduck = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const fetchSystemInfo = async () => {
      loading.value = true
      error.value = null
      try {
        const [infoRes, healthRes, tsduckRes] = await Promise.all([
          api.get('/system/info'),
          api.get('/system/health'),
          api.get('/system/tsduck/check'),
        ])
        info.value = infoRes.data
        health.value = healthRes.data
        tsduck.value = tsduckRes.data
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / 86400)
      const hours = Math.floor((seconds % 86400) / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${days}j ${hours}h ${minutes}m`
    }

    onMounted(() => {
      fetchSystemInfo()
    })

    return {
      info,
      health,
      tsduck,
      loading,
      error,
      formatBytes,
      formatUptime,
    }
  },
}
</script>

<style scoped>
.card {
  margin-bottom: 1rem;
}

.card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}
</style>


