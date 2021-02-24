import Vue from 'vue'
import Router from 'vue-router'
import CoverageParser from './views/CoverageParser.vue'
import TestdoxParser from './views/TestdoxParser.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'coverage-parser',
      component: CoverageParser,
    },
    {
      path: '/testdox',
      name: 'testdox-parser',
      component: TestdoxParser,
    }
  ]
})
