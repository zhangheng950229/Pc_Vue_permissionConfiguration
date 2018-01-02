<template>
  <div>
    <div class='treeNodeText' :id='model.id' :draggable='draggable' @mouseenter='handleMouseEnter' @mouseleave='handleMouseLeave' @dragstart='dragStart' @dragover='dragOver' @dragenter='dragEnter' @dragleave='dragLeave' @drop='drop' @dragend='dragEnd'>
      <span v-show="folderIcon || isShowArrow && !isLoading" :class='[isOpen ? "active" : "", folderIcon ?  (+model.isHasSon) ? "folder-icon" : "leaf-icon" : "node-icon"]' @click='toggle'></span>
      <span v-show="isShowArrow && isLoading" class="el-icon-loading"></span>
      <span v-show='!isEditName' @dblclick='dblclick' @mousedown='handNodeMouseDown'>{{model[props.name]}}</span>
      <span v-if="boundIcon" :class='[ "bound-icon",  model.bound === "1" ? "active" : "" ]'></span>
      <el-form v-show='isEditName' ref='form' :model='form' :rules='rules' style='display:inline-block'>
        <el-form-item prop="_name" size="small">
          <el-input v-model='form._name' @blur="editSubmit" @keyup.enter.prevent.native="editSubmit"></el-input>
          <el-input style="display:none"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class='treeMargin' v-show='isOpen' v-if='isFolder'>
      <tree-node v-for='model in model.children' :model='model' :key='model.id' :draggable="draggable">
      </tree-node>
    </div>
  </div>
</template>

<script>
  import Vue from 'Vue';
  export default {
    name: 'treeNode',
    data() {
      return {
        load: false,
        isShowArrow: true,
        isOpen: false,
        isEditName: false,
        form: {
          _name: ''
        },
        isLoading: false,
        rules: {
          _name: [{
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          }]
        }
      }
    },
    props: {
      model: Object,
      // 当前节点高亮
      draggable: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      /**
       * is Children exist 
       */
      isFolder() {
        if (!this.load) return true;
        return !!(this.model.children &&
          this.model.children.length)
      },
    },
    methods: {
      handleMouseEnter(ev) {
        const color = this.tree.hoverColor;
        ev.target.style.background = color
      },
      handleMouseLeave(ev) {
        ev.target.style.background = ''
      },
      handNodeMouseDown(ev) {
        // ev.preventDefault();
        let tree = this.tree,
          posi = tree.operator.position,
          bound = tree.operatorBound;
        /**
         * currentNode 被点击节点
         */
        tree.currentNode = this.model
        tree.getArguement = this.getArguement.bind(this)
        if (bound.width) {
          let wW = window.innerWidth;
          if (wW - ev.clientX - tree.operatorOffsetX < bound.width) {
            posi.left = ev.clientX - bound.width - 2 * tree.operatorOffsetX
          } else {
            posi.left = ev.clientX
          }
        } else {
          posi.left = ev.clientX
        }
        if (bound.height) {
          let wH = window.innerHeight;
          if (wW - ev.clientY - tree.operatorOffsetY < bound.height) {
            posi.top = ev.clientY - bound.height - 2 * tree.operatorOffsetY;
          } else {
            posi.top = ev.clientY;
          }
        } else {
          posi.top = ev.clientY;
        }
        tree.$emit('node-click', ev, ...this.getArguement(), this)
        // TODO 手动计算
        // layerX -- 非标准属性
        // 找到相对于包含框的距离
        // let tar = ev.target
        // let parent = tar.parentNode;
        // let totalPosi = {
        //   top: tar.offsetTop,
        //   left: tar.offsetLeft
        // };
        // while ( parent !== tar.offsetParent) {
        //   totalPosi.top += parent.offsetTop;
        //   totalPosi.left += parent.offsetLeft;
        //   console.log(parent,totalPosi)
        //   parent = parent.parentElement
        // }
      },
      toggle() {
        const tree = this.tree
        tree.doHide()
        if (tree.lazy && tree.loadFn && !this.load) {
          /**
           * 设置加载图标
           * 传递函数设置子节点
           * 考虑增加标志，记录其子节点是否已经加载
           */
          if (!this.model.children) {
            this.$set(this.model, 'children', [])
          }
          this.isLoading = true;
          tree.loadFn(this, (data) => {
            if (!data instanceof Array) {
              return console.error('data must be Array');
            }
            this.load = true;
            if (!data.length) {
              this.isHasSon = '0'
              this.isShowArrow = false;
              return true
            }
            this.isHasSon = '1'
            this.model.children.push(...data)
            this.isLoading = false;
            this.isShowArrow = true;
            this.isOpen = true;
          }, () => {
            this.isLoading = this.loading = false;
          })
        } else {
          if (this.isFolder) {
            this.isOpen = !this.isOpen
          }
          /**
           * 高亮功能
           * 即仅突出当前被点击的节点同时关闭其他所有节点
           * 涉及树结构深层遍历
           * 树节点数量较大不建议使用
           */
          if (tree.currentHighlight) {
            // 防止已高亮节点被再次点击
            // 遍历重置所有树组件的高亮样式
            // let treeParent = rootTree.$parent
            // let nodeStack = [treeParent.$children[0]]
            // while (nodeStack.length != 0) {
            //   let item = nodeStack.shift()
            //   item.styleObj.background = 'white'
            //   if (item.$children && item.$children.length > 0) {
            //     nodeStack = nodeStack.concat(item.$children)
            //   }
            // }
            // 然后把当前节点的样式设置为高亮
            this.style.background = tree.highlightColor ? tree.highlightColor : '#99A9BF'
            // 设置为当前节点
          }
        }
      },
      exchangeData(rootCom, from, to) {
        //如果drag的目的地是 + - 符号的话，退出。
        if (!to || !from || typeof to == 'string' || from.id == to.id) {
          return
        }
        from = JSON.parse(JSON.stringify(from))
        to = JSON.parse(JSON.stringify(to))
        // copy一个,最后再赋值给state.treeData.这样能保证值的变化都会触发视图刷新(因为JS判断引用类型是否相同是根据内存地址.)
        let treeData = JSON.parse(JSON.stringify(this.model))
        let nodeStack = [treeData]
        let status = 0
        // 如果from或者to节点存在父子/祖辈关系，会报id of undefined的错。这种情况不考虑拖拽功能，所以catch住，返回/return就行
        try {
          // 广度优先遍历,找到涉及数据交换的两个对象.然后交换数据.
          while (!(status === 2)) {
            let item = nodeStack.shift()
            if (item.id == from.id) {
              item.id = to.id
              item.name = to.name
              if (to.children && to.children.length > 0) {
                item['children'] = to.children
              } else {
                item.children = []
              }
              status++
              //找到后,跳出当前循环.
              continue;
            }
            if (item.id == to.id) {
              item.id = from.id
              item.name = from.name
              if (from.children && from.children.length > 0) {
                item['children'] = from.children
              } else {
                item.children = []
              }
              status++
              //找到后,跳出当前循环.
              continue;
            }
            if (item.children && item.children.length > 0) {
              nodeStack = nodeStack.concat(item.children)
            }
          }
        } catch (e) {
          return
        }
        //API: 对外开放交换后的数据的赋值操作
        rootCom.assignData(treeData)
      },
      dblclick() {
        const tree = this.tree;
        if (tree.edit) {
          this.isEditName = !this.isEditName
          this.form._name = this.model[this.props.name]
        }
        this.tree.doHide()
      },
      editSubmit(ev) {
        ev.stopPropagation()
        ev.preventDefault()
        this.$refs.form
          .validate((isValid) => {
            if (isValid) {
              this.tree.$emit('edit-name-valid', this, () => {
                this.isEditName = !isValid
                this.model[this.props.name] = this.form._name
              }, () => {
                this.isEditName = false
                this.form._name = this.model[this.props.name]
              })
            }
          })
        return false
      },
      refreshData() {
        this.load = false;
        this.$set(this.model, 'children', []);
        this.toggle();
      },
      addChild(...args) {
        let def = {
          name: this.tree.defaultText ? this.tree.defaultText : 'New Node',
          id: Math.random()
        }
        if (!this.model.children) {
          this.$set(this.model, 'children', [])
        }
        if (args) {
          this.model.children.push(...args)
        } else {
          this.model.children.push(def)
        }
        // open the folder
        this.isOpen = true;
      },
      removeChild(selfId) {
        // 获取父组件的model.children
        // 在父组件model.children里删除
        if (this === this.tree) {
          return console.error('Root can\'t not delete!')
        }
        let $parent = this.$parent,
          parentModelChildren;
        if ($parent.isTree) {
          parentModelChildren = $parent.root
        } else {
          parentModelChildren = $parent.model.children
        }
        for (let index in parentModelChildren) {
          // 找到该删的id
          if (parentModelChildren[index].selfId == selfId) {
            parentModelChildren.splice(index, 1)
            break
          }
        }
      },
      dragStart(ev) {
        this.tree.doHide()
        ev.dataTransfer.effectAllowed = 'move';
        // TODO
        ev.dataTransfer.setData('text/plain', this.model.id);
        this.tree.$emit('node-drag-start', ev, ...this.getArguement(), this)
        return true
      },
      dragEnd(ev) {
        const tree = this.tree;
        tree.dragEnd()
      },
      dragOver(ev) {
        ev.preventDefault()
        ev.dataTransfer.dropEffect = 'move';
        return true
      },
      dragEnter(ev) {
        ev.stopPropagation();
        const target = ev.target,
          tree = this.tree,
          className = target.className;
        if (target.tagName === 'SPAN') {
          this.isInSpan = true;
          return
        }
        this.handleStyle(ev.target, this.tree.dragOption.style, 1)
        /**
         * 无需拖拽交换数据
         * 暂时关闭该功能
         */
        // rootTree.exchangeData(rootTree.$parent, fromData, toData)
      },
      dragLeave(ev) {
        ev.stopPropagation();
        let target = ev.target;
        if (target.tagName === 'SPAN') {
          this.isInSpan = false;
          return
        }
        if (ev.target.className.indexOf('treeNodeText') !== -1) {
          this.handleStyle(ev.target, this.tree.dragOption.style, 0)
        }
      },
      drop(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.isInSpan = false;
        this.handleStyle(ev.target, this.tree.dragOption.style, 0)
        this.tree.$emit('node-drag-drop', ev, ...this.getArguement(), this)
      },
      getArguement() {
        return [this.addChild.bind(this), this.removeChild.bind(this, this.model.id)]
      },
      /**@augments
        action 1 -- add
               0 -- clear
       */
      handleStyle(ele, style, action) {
        if (this.isInSpan || !style)
          return
        while (ele.className.indexOf('treeNodeText') === -1) {
          ele = ele.parentElement;
        }
        const keys = Object.keys(style) || []
        keys.forEach(key => ele.style[key] = action ? style[key] : '')
      }
    },
    /**
     * 将根节点的Vue实例挂载在tree上
     * 方便子节点与父节点进行交互
     */
    created() {
      const parent = this.$parent;
      if (parent.isTree) {
        this.tree = parent;
      } else {
        this.tree = parent.tree;
      }
      const tree = this.tree;
      this.folderIcon = tree.folderIcon;
      this.boundIcon = tree.boundIcon;
      this.props = tree.props;
      document.ondragover = function(e) {
        e.stopPropagation();
      }
      document.ondrop = function(e) {
        e.stopPropagation();
      }
      if (!tree) {
        console.warn('Can not find node\'s tree.');
      }
    },
  }
</script>

<style>
  .treeNodeText {
    line-height: 32px;
    font-size: 12px;
  }
  .treeMargin {
    margin-left: 20px;
  }
  .changeTree {
    width: 1rem;
    color: #324057;
  }
  .node-icon {
    display: inline-block;
    width: 0;
    height: 0;
    padding-right: 3px;
    border-left: 6px solid black;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 0 solid yellow;
    transition: transform .3s ease-in-out;
  }
  .node-icon.active {
    transform: rotate(90deg);
  }
  .folder-icon {
    display: inline-block;
    vertical-align: middle;
    width: 14px;
    height: 14px;
    background-image: url('./asserts/folder-icon.png')
  }
  .folder-icon.active {
    background-image: url('./asserts/folder-icon-active.png')
  }
  .leaf-icon {
    display: inline-block;
    vertical-align: middle;
    width: 11px;
    height: 14px;
    background-image: url('./asserts/leaf-icon.png')
  }
  .bound-icon {
    display: inline-block;
    vertical-align: middle;
    width: 14px;
    height: 14px;
    background-image: url('./asserts/bound-icon.png')
  }
  .bound-icon.active {
    background-image: url('./asserts/bound-icon-active.png')
  }
</style>
