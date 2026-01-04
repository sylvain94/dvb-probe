<template>
  <div>
    <div class="header">
      <h2>Streams</h2>
      <button class="btn btn-primary" @click="showCreateModal = true">New stream</button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Adresse</th>
            <th>Port</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stream in streams" :key="stream.id">
            <td>{{ stream.id }}</td>
            <td>{{ stream.name }}</td>
            <td>{{ stream.type }}</td>
            <td>{{ stream.address }}</td>
            <td>{{ stream.port }}</td>
            <td class="actions">
              <button class="btn btn-primary" @click="editStream(stream)">Edit</button>
              <button class="btn btn-danger" @click="deleteStream(stream.id)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create modal -->
    <div v-if="showCreateModal" class="modal">
      <div class="modal-content">
        <h3>New stream</h3>
        <form @submit.prevent="createStream">
          <div class="form-group">
            <label>Name</label>
            <input v-model="newStream.name" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newStream.description"></textarea>
          </div>
          <div class="form-group">
            <label>Type of stream</label>
            <select v-model="newStream.type" required>
              <option value="udp">UDP</option>
              <option value="rtp">RTP</option>
            </select>
          </div>
          <div class="form-group">
            <label>IP address</label>
            <input v-model="newStream.address" type="text" required />
          </div>
          <div class="form-group">
            <label>Port number</label>
            <input v-model.number="newStream.port" type="number" min="1" max="65535" required />
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
        <h3>Edit stream</h3>
        <form @submit.prevent="updateStream">
          <div class="form-group">
            <label>Name</label>
            <input v-model="editingStream.name" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="editingStream.description"></textarea>
          </div>
          <div class="form-group">
            <label>Type of stream</label>
            <select v-model="editingStream.type" required>
              <option value="udp">UDP</option>
              <option value="rtp">RTP</option>
            </select>
          </div>
          <div class="form-group">
            <label>IP address</label>
            <input v-model="editingStream.address" type="text" required />
          </div>
          <div class="form-group">
            <label>Port number</label>
            <input v-model.number="editingStream.port" type="number" min="1" max="65535" required />
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
import { useStreamsStore } from '../stores/streams'
import { onMounted, ref } from 'vue'

export default {
  name: 'StreamsView',
  setup() {
    const streamsStore = useStreamsStore()
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const editingStream = ref(null)
    const newStream = ref({
      name: '',
      description: '',
      type: 'udp',
      address: '',
      port: 5004,
    })

    onMounted(async () => {
      await streamsStore.fetchStreams()
    })

    const createStream = async () => {
      try {
        await streamsStore.createStream(newStream.value)
        showCreateModal.value = false
        newStream.value = {
          name: '',
          description: '',
          type: 'udp',
          address: '',
          port: 5004,
        }
      } catch (error) {
        console.error('Error creating stream:', error)
      }
    }

    const editStream = (stream) => {
      editingStream.value = {
        id: stream.id,
        name: stream.name || '',
        description: stream.description || '',
        type: stream.type || 'udp',
        address: stream.address || '',
        port: stream.port || 5004,
      }
      showEditModal.value = true
    }

    const updateStream = async () => {
      try {
        await streamsStore.updateStream(editingStream.value.id, {
          name: editingStream.value.name,
          description: editingStream.value.description,
          type: editingStream.value.type,
          address: editingStream.value.address,
          port: editingStream.value.port,
        })
        showEditModal.value = false
        editingStream.value = null
      } catch (error) {
        console.error('Error updating stream:', error)
      }
    }

    const deleteStream = async (id) => {
      if (confirm('Are you sure you want to delete this stream?')) {
        try {
          await streamsStore.deleteStream(id)
        } catch (error) {
          console.error('Error deleting stream:', error)
        }
      }
    }

    return {
      streams: streamsStore.streams,
      loading: streamsStore.loading,
      error: streamsStore.error,
      showCreateModal,
      showEditModal,
      editingStream,
      newStream,
      createStream,
      editStream,
      updateStream,
      deleteStream,
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
}
</style>


