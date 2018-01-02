<template>
  <div class="navlist">
    <template v-for="item in routes">
      <el-submenu :index="item.name" v-if="!item.noDropdown" v-show="!item.hidden">
        <template slot="title">
          <i :class="item.icon"></i>
          <span slot="title">{{item.name}}</span>
        </template>

    <template v-for="child in item.children" v-if='!child.hidden'>
          <sidebar-item v-if='child.children&&child.children.length>0' :routes='[child]'>
          </sidebar-item>
          <router-link v-else :to="item.path+'/'+child.path" v-show="!child.hidden">
            <el-menu-item :index="item.path+'/'+child.path">
              <i :class="child.icon"></i>
              <span slot="title">{{child.name}}</span>
            </el-menu-item>
          </router-link>
        </template>
      </el-submenu>
    </template>
  </div>
</template>

<script>
  export default {
    name: 'SidebarItem',
    props: {
      routes: {
        type: Array
      }
    }
  }
</script>

<style lang="scss">
  .navlist {
    margin: 20px 0 0 21px
  }
</style>
