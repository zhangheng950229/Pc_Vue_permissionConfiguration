<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'APP'
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import url('./style/index.scss');
  #app {
    position: relative;
    margin: 0 auto;
    width: 100%;
    min-width: 1200px;
    height: 100%;
  }
</style>
