<template>
  <div>
    <div class="header">
      <h2>Probes</h2>
      <button class="btn btn-primary" @click="showCreateModal = true">New probe</button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Stream</th>
            <th>Profile</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="probe in probes" :key="probe.id">
            <td>{{ probe.id }}</td>
            <td>{{ probe.name }}</td>
            <td>{{ probe.stream_id }}</td>
            <td>{{ probe.profile }}</td>
            <td>
              <span :class="`status-badge status-${probe.status}`">
                {{ probe.status }}
              </span>
            </td>
            <td class="actions">
              <button 
                v-if="probe.status !== 'running'"
                class="btn btn-success"
                @click="startProbe(probe.id)"
              >
                Start
              </button>
              <button 
                v-else
                class="btn btn-danger"
                @click="stopProbe(probe.id)"
              >
                Stop
              </button>
              <button 
                class="btn btn-primary"
                @click="editProbe(probe)"
                :disabled="probe.status === 'running'"
              >
                Edit
              </button>
              <button 
                class="btn btn-danger"
                @click="deleteProbe(probe.id)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal of creation -->
    <div v-if="showCreateModal" class="modal">
      <div class="modal-content">
        <h3>New probe</h3>
        <form @submit.prevent="createProbe">
          <div class="form-group">
            <label>Name</label>
            <input v-model="newProbe.name" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newProbe.description"></textarea>
          </div>
          <div class="form-group">
            <label>Stream</label>
            <select v-model="newProbe.streamId" required>
              <option v-for="stream in streams" :key="stream.id" :value="stream.id">
                {{ stream.name }} ({{ stream.address }}:{{ stream.port }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Profile</label>
            <select v-model="newProbe.profile">
              <option value="basic">Basic</option>
              <option value="detailed">Detailed</option>
              <option value="monitoring">Monitoring</option>
            </select>
          </div>
          <div class="form-group">
            <label>Output format</label>
            <select v-model="newProbe.outputFormat">
              <option value="text">Text</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Create</button>
            <button type="button" class="btn" @click="showCreateModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit modal -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <h3>Edit probe</h3>
        <form @submit.prevent="updateProbe">
          <div class="form-group">
            <label>Name</label>
            <input v-model="editingProbe.name" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="editingProbe.description"></textarea>
          </div>
          <div class="form-group">
            <label>Stream</label>
            <select v-model="editingProbe.streamId" required>
              <option v-for="stream in streams" :key="stream.id" :value="stream.id">
                {{ stream.name }} ({{ stream.address }}:{{ stream.port }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Profile</label>
            <select v-model="editingProbe.profile">
              <option value="basic">Basic</option>
              <option value="detailed">Detailed</option>
              <option value="monitoring">Monitoring</option>
            </select>
          </div>
          <div class="form-group">
            <label>Output format</label>
            <select v-model="editingProbe.outputFormat">
              <option value="text">Text</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Update</button>
            <button type="button" class="btn" @click="showEditModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useProbesStore } from '../stores/probes'
import { useStreamsStore } from '../stores/streams'
import { onMounted, ref } from 'vue'

export default {
  name: 'ProbesView',
  setup() {
    const probesStore = useProbesStore()
    const streamsStore = useStreamsStore()
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const editingProbe = ref(null)
    const newProbe = ref({
      name: '',
      description: '',
      streamId: null,
      profile: 'basic',
      outputFormat: 'text',
    })

    onMounted(async () => {
      await probesStore.fetchProbes()
      await streamsStore.fetchStreams()
    })

    const createProbe = async () => {
      try {
        await probesStore.createProbe(newProbe.value)
        showCreateModal.value = false
        newProbe.value = {
          name: '',
          description: '',
          streamId: null,
          profile: 'basic',
          outputFormat: 'text',
        }
      } catch (error) {
        console.error('Error creating probe:', error)
      }
    }

    const startProbe = async (id) => {
      try {
        await probesStore.startProbe(id)
        // Refresh the probes list to get updated status
        await probesStore.fetchProbes()
      } catch (error) {
        console.error('Error starting probe:', error)
        // Refresh anyway to get current state
        await probesStore.fetchProbes()
      }
    }

    const stopProbe = async (id) => {
      try {
        await probesStore.stopProbe(id)
        // Refresh the probes list to get updated status
        await probesStore.fetchProbes()
      } catch (error) {
        console.error('Error stopping probe:', error)
        // Refresh anyway to get current state
        await probesStore.fetchProbes()
      }
    }

    const editProbe = (probe) => {
      editingProbe.value = {
        id: probe.id,
        name: probe.name || '',
        description: probe.description || '',
        streamId: probe.stream_id || probe.streamId || null,
        profile: probe.profile || 'basic',
        outputFormat: probe.output_format || probe.outputFormat || 'text',
      }
      showEditModal.value = true
    }

    const updateProbe = async () => {
      try {
        await probesStore.updateProbe(editingProbe.value.id, {
          name: editingProbe.value.name,
          description: editingProbe.value.description,
          streamId: editingProbe.value.streamId,
          profile: editingProbe.value.profile,
          outputFormat: editingProbe.value.outputFormat,
        })
        showEditModal.value = false
        editingProbe.value = null
      } catch (error) {
        console.error('Error updating probe:', error)
      }
    }

    const deleteProbe = async (id) => {
      if (confirm('Are you sure you want to delete this probe?')) {
        try {
          await probesStore.deleteProbe(id)
        } catch (error) {
          console.error('Error deleting probe:', error)
        }
      }
    }

    return {
      probes: probesStore.probes,
      streams: streamsStore.streams,
      loading: probesStore.loading,
      error: probesStore.error,
      showCreateModal,
      showEditModal,
      editingProbe,
      newProbe,
      createProbe,
      editProbe,
      updateProbe,
      startProbe,
      stopProbe,
      deleteProbe,
    }
  },
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.actions .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>


