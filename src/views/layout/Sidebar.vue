<template>
  <el-menu class="sidebar" :default-active="$route.path" background-color="#2A3542" text-color="#B5B7BB" :collapse="collapse" active-text-color="#3398DB">
    <div :class="{ collapse: collapse, toggler: !collapse }" @click="handleCollapse">
      <span class="cut-off"></span>
      <span class="cut-off"></span>
      <span class="cut-off"></span>
    </div>
    <div class="clearfix"></div>
    <sidebar-item :routes='routes'></sidebar-item>
  </el-menu>
</template>

<script>
  import sidebarItem from "./SidebarItem";
  export default {
    data() {
      return {
        collapse: false,
        height: 840
      };
    },
    props: {
      isCollapse: {
        type: Boolean,
        default: false
      },
      routes: Array
    },
    methods: {
      handleCollapse() {
        this.collapse = !this.collapse
        this.$emit('update:isCollapse', this.collapse)
      },
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    },
    components: {
      sidebarItem
    },
    created() {}
  };
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .sidebar:not(.el-menu--collapse) {
    width: 230px;
  }
  .sidebar {
    position: relative;
    float: left; // width: 230px;
    margin-bottom: -4000px;
    padding-bottom: 4000px;
    border-top: 1px solid #2c3541;
    background-color: #2c3541;
    .toggler {
      float: right;
      margin: 18px 12px 0 0;
      cursor: pointer;
    }
    .collapse {
      width: 21px;
      margin: 18px auto 0;
    }
    .cut-off {
      display: block;
      width: 19px;
      height: 0;
      border: 1px solid #707070;
      margin-bottom: 3px;
    }
  }
</style>
