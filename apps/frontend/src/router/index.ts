import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import EditorView from '@/views/EditorView.vue'
import WorkshopView from '@/views/WorkshopView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import { useUserStore } from '@/stores/user'
import RenderLayoutView from '@/views/RenderLayoutView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/render/:projectId',
    name: 'render-layout',
    component: RenderLayoutView,
    meta: {
      requiresAuth: false,
      isRenderLayout: true, 
    },
  {
    path: '/editor/:projectId',
    name: 'editor',
    component: EditorView,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/workshop',
    name: 'workshop',
    component: WorkshopView,
    meta: { requiresAuth: true },
  },
  {
    path: '/auth/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: '/auth/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = !!userStore.accessToken

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
