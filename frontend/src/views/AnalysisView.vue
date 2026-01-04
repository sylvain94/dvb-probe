<template>
  <div>
    <h2>Analysis</h2>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div class="card">
      <p v-if="analyses.length === 0">No analysis available</p>
      <div v-else>
        <div v-for="analysis in analyses" :key="analysis.id" class="analysis-item">
          <h4>Analysis #{{ analysis.id }}</h4>
          <p><strong>Probe:</strong> {{ analysis.probe_id }}</p>
          <p><strong>Stream:</strong> {{ analysis.stream_id }}</p>
          <p><strong>Timestamp:</strong> {{ new Date(analysis.timestamp).toLocaleString() }}</p>
          <pre v-if="analysis.data">{{ JSON.stringify(JSON.parse(analysis.data), null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api'
import { onMounted, ref } from 'vue'

export default {
  name: 'AnalysisView',
  setup() {
    const analyses = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchAnalyses = async () => {
      loading.value = true
      error.value = null
      try {
        const { data } = await api.get('/analysis')
        analyses.value = data
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchAnalyses()
    })

    return {
      analyses,
      loading,
      error,
    }
  },
}
</script>

<style scoped>
.analysis-item {
  border-bottom: 1px solid #eee;
  padding: 1rem 0;
}

.analysis-item:last-child {
  border-bottom: none;
}

pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.85rem;
}
</style>


