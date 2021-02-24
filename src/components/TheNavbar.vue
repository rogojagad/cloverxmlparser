<template>
  <div>
    <b-navbar shadow>
      <template slot="start">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">Test Coverage Parser</b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: '/testdox' }">Testdox Parser</b-navbar-item>
      </template>
    </b-navbar>
  </div>
</template>

<script>
export default {

}
</script>

