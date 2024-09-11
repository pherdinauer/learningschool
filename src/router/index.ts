import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import VideoManagementView from '../views/VideoManagementView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import PlaylistView from '../views/PlaylistView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/video-management',
    name: 'VideoManagement',
    component: VideoManagementView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: FavoritesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/playlists',
    name: 'Playlists',
    component: PlaylistView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const userRole = localStorage.getItem('userRole')
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userRole) {
      next('/login')
    } else if (to.matched.some(record => record.meta.requiresAdmin) && userRole !== 'admin') {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router