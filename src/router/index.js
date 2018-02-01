import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const login = _ => import('@/components/login/login')
const index = _ => import('@/components/chatroom/chatroom')

var router = new Router({
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
      component: index,
      /**
       * router前置守卫 -- index页面
       */
      beforeEnter: (to, from, next) => {
        next();
      },
      afterEach: (to, from) => {

      }
    }
  ]
})

/**
 * router前置守卫 -- all
 */
router.beforeEach((to, from, next) => {
  next();
})

/**
 * router后置守卫 -- all
 */
router.afterEach((to, from) => {

})

export default router;
