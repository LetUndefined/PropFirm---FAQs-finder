import MainLayout from '@/layout/MainLayout.vue';
import HomeView from '@/views/HomeView.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'homeview',
          component: HomeView,
        },
        {
          path: 'propview',
          name: 'propview',
          component: () => import('@/views/PropView.vue'),
        },
        {
          path: 'propview/:id',
          name: 'propviewId',
          component: () => import('@/views/PropView.vue'),
        },
      ],
    },
  ],
});

export default router;
