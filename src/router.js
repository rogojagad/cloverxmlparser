import Vue from 'vue'
import Router from 'vue-router'
import CoverageParserPage from './pages/CoverageParserPage.vue'
import TestdoxParserPage from './pages/TestdoxParserPage.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'coverage-parser',
      component: CoverageParserPage,
    },
    {
      path: '/testdox',
      name: 'testdox-parser',
      component: TestdoxParserPage,
    }
  ]
})
