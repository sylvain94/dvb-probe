import { defineStore } from 'pinia'
import api from '../api'

export const useProbesStore = defineStore('probes', {
  state: () => ({
    probes: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchProbes() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/probes')
        this.probes = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createProbe(probeData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/probes', probeData)
        this.probes.push(data)
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProbe(id, probeData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.put(`/probes/${id}`, probeData)
        const index = this.probes.findIndex(p => p.id === id)
        if (index !== -1) {
          this.probes[index] = data
        }
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteProbe(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/probes/${id}`)
        this.probes = this.probes.filter(p => p.id !== id)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async startProbe(id) {
      this.error = null
      try {
        const { data } = await api.post(`/probes/${id}/start`)
        await this.fetchProbes()
        return data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async stopProbe(id) {
      this.error = null
      try {
        const { data } = await api.post(`/probes/${id}/stop`)
        await this.fetchProbes()
        return data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
  },
})


