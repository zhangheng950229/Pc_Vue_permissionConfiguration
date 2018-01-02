<template>
  <div class="tree-container">
    <tree-node v-for="child in root" :model='child' :key="child.id" :draggable="dragOption.draggable">
    </tree-node>
    <div v-if="root.length === 0">
      <p>请进行初始化</p>
    </div>
    <transition name="el-fade-in">
      <div class="tree-operator" v-show="operator.visible" v-bind:style="operatorPosi" @click='handleOperatorClick($event)'>
        <div ref='left' v-show="operator.left.visible">
          <slot name="left"></slot>
        </div>
        <div ref='right' v-show="operator.right.visible">
          <slot name="right"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  // TODO - 新增props，用于自定数据字段名 2017.11.21 已增加 name|children待完成
  // TODO - 节点懒加载 lazy - loadFn and Add refreshData 刷新当前节点数据
  // TODO - Operator auto Hide
  /**
   * luoliang01
   * 
   * Attr 
   *  folderIcon   折叠图标 - 不启动则使用默认三角号
   *               启用为渠道图片 - 暂不支持定制
   *  boundIcon    绑定图标 - 采用bound字段
   *               同上，暂不支持定制
   *  props        Object 用于指定节点数据名称
   *                name 用于指定节点名的属性名
   *                children 用于指定儿子属性名 
   *  model        Object 数据
   *  lazy         Boolean 节点懒加载
   *  loadFn       Function 加载数据函数 @augments model - resolve - reject
   *  edit         Boolean 节点名称是否可编辑
   *  default-text String 节点默认名称
   *  hover-color  String 节点Hover颜色
   *  highlight-color String 节点高亮颜色  //Notes 存在问题 不建议使用
   *  operator-offset Nunmber 相对鼠标鼠标点击偏移量
   *  drag-option     Object  
   *    key       value
   *    draggable  Boolean
   *    highlight  Boolean
   *    style      Object
   *      当开启高亮功能，传入对象，将全部覆盖至目标中
   * Function 
   *  默认关闭当前挂在元素的右键菜单
   *  支持两个鼠标面板 - 通过slot left/right 分发
   *  Operator - doToggle / doShow @argument String left - right / doHide
   *  
   *  refreshData 重新加载该节点数据 会重新调用 loadFn
   * 
   * Event 
   *  
   *  edit-name-valid 改名合法
   *  node-click @argument event / addFunc @augments nodeData / removeFunc / node
   *  operator-click @argument 同上
   *    采用传入的两个函数操作节点，尽量不要手动更改节点属性
   *  //TODO 可选隐藏node - 对外暴露方法获取信息
   *    需要获取节点信息通过第四个参数获取
   *  //TODO 确定参数
   *  //TODO 限制功能
   *  node-drag-start @argument 同上
   *  node-drag-drop @argument 同上
   * Callback
   *  nodeEnd  拖拽结束后执行
   */
  /**
   *  新增Tree组件，用于数据交互
   *    1、保存所有子节点共有属性
   *    2、将子节点所需向下传递
   *    3、用于接受子节点向外进行交互
   *  
   *  主要功能点：
   *    1、双击改名
   *    2、单击当前节点加粗 - 弹出节点信息及解绑面板（增加节点信息面板）
   *    3、右键当前节点不变 - 弹出增删节点面板（增加节点操作列）
   *    4、操作及获取增加异步API，对外开放
   *    5、跨树之间拖拽 - 拖拽落下需对外提供API 
   *                    可拖拽开关 ／ 落点需要两个节点的数据
   *    6、节点详细信息暂时 - 折叠图标及绑定图标 - 特殊需求 暂不可定制
   *                    
   */
  import treeNode from './TreeNode';
  // import { transition } from 'element-ui';
  import {
    on,
    off
  } from 'element-ui/src/utils/dom';
  export default {
    name: 'Tree',
    data() {
      return {
        currentNode: null,
        operator: {
          visible: false,
          position: {
            top: 0,
            left: 0,
          },
          left: {
            visible: false,
          },
          right: {
            visible: false,
          }
        }
      }
    },
    computed: {
      // 接受外部 offset 设置Panel相对于鼠标偏移量
      operatorPosi() {
        const {
          top,
          left
        } = this.operator.position
        return {
          top: top + Number(this.operatorOffsetY) + 'px',
          left: left + Number(this.operatorOffsetX) + 'px'
        }
      }
    },
    props: {
      root: Array,
      // 懒加载及函数
      lazy: Boolean,
      edit: Boolean,
      loadFn: Function,
      // 当前节点高亮
      currentHighlight: {
        type: Boolean,
        default: false
      },
      folderIcon: {
        type: Boolean,
        default: false
      },
      boundIcon: {
        type: Boolean,
        default: false
      },
      userIcon: {
        type: Object,
        default () {
          return {
            switch: false,
            name: '',
            formatter: () => {}
          }
        }
      },
      operatorBound: {
        type: Object,
        default () {
          return {

          }
        }
      },
      // 高亮颜色
      highlightColor: {
        type: String,
        default: ''
      },
      // 节点默认名称
      props: {
        type: Object,
        default () {
          return {
            name: 'name',
            children: 'children'
          }
        }
      },
      defaultText: String, // 填加节点时显示的默认文本．
      // TODO 鼠标划入颜色
      hoverColor: String,
      // 偏移量
      operatorOffsetX: {
        type: Number,
        default: 10
      },
      operatorOffsetY: {
        type: Number,
        default: 10
      },
      // 拖拽配置
      dragOption: {
        type: Object,
        default: () => ({
          draggable: false,
          highlight: false,
          style: {
            background: 'white'
          }
        }),
      },
      dragEnd: {
        type: Function,
        default: function() {}
      }
    },
    methods: {
      handleOperatorClick(ev) {
        this.$emit('operator-click', ev, ...this.getArguement && this.getArguement(), this.currentNode)
      },
      /**
       * 代理全局Click事件
       * 点击容器以外元素隐藏操作列
       */
      handleDocumentClick(e) {
        if (!this.$el ||
          this.$refs.left.contains(e.target) ||
          this.$refs.right.contains(e.target) ||
          e.target.tagName === 'SPAN') return;
        this.doHide()
      },
      doToggle() {
        this.operator.visible = !this.operator.visible
      },
      doShow(type) {
        this.doHide()
        if (type) {
          this.operator[type].visible = true
        }
        this.operator.visible = true
      },
      doHide() {
        let operator = this.operator;
        operator.visible = operator.left.visible = operator.right.visible = false
      }
    },
    components: {
      treeNode
      // transition
    },
    /**
     * 设置标志供子节点判断父节点
     * 使用当前实例对外进行交互
     */
    created() {
      this.isTree = true;
    },
    mounted() {
      // 关闭右键菜单
      on(this.$el, 'contextmenu', (ev) => {
        ev.preventDefault();
        return false
      })
      // 代理点击 - 用于关闭菜单
      on(document, 'click', this.handleDocumentClick);
    },
    destroyed() {
      off(document, 'click', this.handleDocumentClick);
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .tree-container {
    position: relative;
    padding: 12px 12px 12px 18px;
  }
  .tree-operator {
    position: fixed;
    background-color: #fff;
    z-index: 1050;
  }
</style>