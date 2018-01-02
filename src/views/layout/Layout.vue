<template>
  <div class="app-wrapper" :class="{ collapse: isCollapse}">
    <Top></Top>
    <div style="overflow:hidden">
      <sidebar :style="{minHeight:sidebarMinHeight}" :routes="constantRouterMap" :isCollapse.sync="isCollapse"></sidebar>
      <app-main :style="{minHeight:mainMinHeight}" class="main-container"></app-main>
      <foot ></foot>
    </div>
  </div>
</template>

<script>
  import * as components from "./index";
  import {
    constantRouterMap
  } from '@/router'
  export default {
    name: "app",
    components: {
      ...components
    },
    data() {
      return {
        height: 840,
        isCollapse: false,
        constantRouterMap: constantRouterMap
      }
    },
    computed: {
      sidebarMinHeight: function () {
        return this.height - 70 + 'px'
      },
      mainMinHeight: function () {
        return this.height - 70 - 48 + 'px'
      },
      mainMarginLeft: function () {
        return (this.isCollapse ? 65 : 230) + 'px'
      }
    },
    created() {
      this.height = document.documentElement.clientHeight || document.body.clientHeight
    }
  };
</script>

<style rel="stylesheet/scss" lang="scss">
  .app-wrapper {
    position: relative;
    transition: margin-left 0.28s ease-out;
    &.collapse {
      .main-container {
        position:relative;
        margin-left: 65px;
      }
      .footer {
        margin-left: 65px;
      }
    }
    .main-container {
      position:relative;
      margin-left: 230px;
      padding: 25px 30px 34px 30px;
    }
  }
</style>