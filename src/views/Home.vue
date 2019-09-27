<template>
  <div class="home">
    <XmlParser/>
  </div>
</template>

<script>
// @ is an alias to /src
import XmlParser from '@/components/XmlParser.vue'

export default {
  name: 'home',
  components: {
    XmlParser
  }
}
</script>
