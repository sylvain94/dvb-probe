import { createRouter, createWebHistory } from 'vue-router'
import ProbesView from '../views/ProbesView.vue'
import StreamsView from '../views/StreamsView.vue'
import AnalysisView from '../views/AnalysisView.vue'
import SystemView from '../views/SystemView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'probes',
      component: ProbesView
    },
    {
      path: '/streams',
      name: 'streams',
      component: StreamsView
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: AnalysisView
    },
    {
      path: '/system',
      name: 'system',
      component: SystemView
    }
  ]
})

export default router


