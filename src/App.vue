<template>
  <div>
    <the-navbar></the-navbar>
    <router-view class="content"/>
  </div>
</template>
<script>
import TheNavbar from "@/components/TheNavbar.vue";

export default {
  components: {
    TheNavbar
  }
}
</script>
<style>
.content {
  padding-top: 1.5%;
}

.container {
  margin-top: 2%;
}

.health-skipped {
  background: grey;
  color: black;
}

.health-dangerous {
  background: #b50000;
  color: white;
}

.health-warning {
  background: yellow;
  color: black;
}

.health-decent {
  background: #beff4f;
  color: black;
}

.health-good {
  background: #00ff00;
  color: black;
}

.health-perfect {
  background: #00ff00;
  color: black;
  font-weight: bold;
}

.centerbold {
  font-weight: bolder;
  text-align: center;
}

b-table-column {
  word-wrap: break-word;
}
</style>
