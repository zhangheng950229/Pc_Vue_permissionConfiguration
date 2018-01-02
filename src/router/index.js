import Vue from 'vue'
import Router from 'vue-router'
/**
 * Lazy load the view component
 * @param { String } path 
 * @returns { Function } 
 */

const _import = path => () => import('@/views/' + path + '.vue')

Vue.use(Router)



import Layout from '@/views/layout/Layout'
import Restricted from '@/views/layout/Restricted'

export const constantRouterMap = [
  {
    path: '/buisArch',
    name: '业务架构配置',
    redirect: '/buisArch/query',
    icon: 'arch-icon',
    noDropdown: false,
    component: Layout,
    children: [
      {
        path: 'query',
        component: _import('architecture/BusiArchCheck'),
        name: '业务架构'
      },
      {
        path: 'add',
        component: _import('architecture/BusiArchCfg'),
        noDropdown: false,
        hidden: true,
        name: '创建业务架构'
      },
      {
        path: 'update',
        component: _import('architecture/BusiArchCfg'),
        noDropdown: false,
        hidden: true,
        name: '配置业务架构'
      }
    ]
  },
  {
    path: '/dataAuth',
    name: '数据权限配置',
    redirect: '/dataAuth/userManage',
    icon: 'auth-icon',
    noDropdown: false,
    component: Layout,
    children: [
      {
        path: 'userManage',
        component: _import('permission/index'),
        name: '用户管理'
      },
      {
        path: 'userAdd',
        component: _import('permission/children/add'),
        hidden: true,
        name: '新增用户'
      },
      {
        path: 'userUpdate',
        component: _import('permission/children/add'),
        hidden: true,
        name: '编辑用户'
      },
      {
        path: 'jurisdiction',
        component: _import('permission/jurisdiction'),
        name: '权限查看'
      }
    ]
  }
]



export default new Router({
  routes: [{
    path: '/restricted',
    component: Restricted
  }, {
    path: '/',
    redirect: '/buisArch/query',
    component: Layout
  }, ...constantRouterMap, {
    path: '*',
    redirect: '/'
  }]
})
