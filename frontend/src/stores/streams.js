import { defineStore } from 'pinia'
import api from '../api'

export const useStreamsStore = defineStore('streams', {
  state: () => ({
    streams: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchStreams() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/streams')
        this.streams = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createStream(streamData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/streams', streamData)
        this.streams.push(data)
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateStream(id, streamData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.put(`/streams/${id}`, streamData)
        const index = this.streams.findIndex(s => s.id === id)
        if (index !== -1) {
          this.streams[index] = data
        }
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteStream(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/streams/${id}`)
        this.streams = this.streams.filter(s => s.id !== id)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})


