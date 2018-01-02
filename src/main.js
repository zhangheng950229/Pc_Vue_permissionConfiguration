// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import utils from '@/utils/common'
import axios from '@/utils/fetch.base'
import VueAxios from 'vue-axios'
//TODD 实现按需加载
import ElementUI from 'element-ui'
import '../theme/index.css'
import router from './router'

/**
 * 挂在全局方法至Vue上
 */
Vue.use(utils)

Vue.use(ElementUI)
/**
 * VueAxios 
 * 将Axios挂载在Vue原型上
 * 且设置axios、$http - getter 直接返回传入的axios
 * 业务数据逻辑自行封装且挂在到axios上
 * 于实例中直接this.axios.[模块名][方法名]访问
 */
Vue.use(VueAxios, axios)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
