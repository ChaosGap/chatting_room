import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const login = _ => import('@/components/login/login')
const index = _ => import('@/components/chatroom/chatroom')

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'login',
      component: login,
    },
    {
      path: '/',
      name: 'index',
      component: index
    }
  ]
})
