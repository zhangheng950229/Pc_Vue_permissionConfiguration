<template>
  <div class="userAdd">
    <h3 class="userTitle">{{name}}</h3>
    <el-form :model="userForm" :rules="userRules" ref="userForm" label-width="100px" class="userForm">
      <el-form-item label="业务线" prop="circuit">
        <el-select :disabled="isEdit" class="userSelect" v-model="userForm.circuit" placeholder="请选择业务线" @change="circuitChange(userForm.circuit)" value-key="id">
          <el-option v-for="(item, index) in allLine" :label="item.lineName" :value="item" :key="index">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="品牌" prop="business">
        <el-select :disabled="isEdit" class="userSelect" v-model="userForm.business" placeholder="请选择品牌" @change="businessChange(userForm.business)">
          <el-option v-for="(item, index) in userForm.circuit.listBrand" :label="item.brandName" :value="item.brandCode" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="登录名(OA)" prop="ownerVal">
        <el-select v-model="userForm.ownerVal" filterable remote class="userSelect" placeholder="请输入关键字" @change="ownersChange(userForm.ownerVal)" :remote-method="remoteMethod" :disabled='isOwner'>
          <el-option v-for="(item, index) in ownerList" :key="index" :label="item" :value="item">
          </el-option>
        </el-select>
        <div class="userList">
          <div>
            <span v-for='(item,index) in userList' class="user-people" :key="index">
                                  <span>{{item}}</span>
            <i v-if="!isEdit" class="el-icon-circle-close-outline user-close" @click="userDelete(item,index)"></i>
            </span>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="数据权限" prop="competence">
        <div class="competence">
          <div class="competence-title">
            <el-button type="primary" class="title-buttom" @click="handleAccountAuth">复制账号权限</el-button>
            <el-popover ref="arch-copy" placement="right" width="400" style="padding:0;" v-model="visible">
              <div class="arch-copy-title">
                被复制人账号
                <span class="close fr" @click="visible = false"></span>
              </div>
              <el-form class="arch-copy-from" ref="copyForm" :model="userForm" :rules="userRules" label-width="120px">
                <el-form-item prop="copyVal" label="登录名(OA)">
                  <el-select v-model="userForm.copyVal" filterable remote placeholder="请输入关键字" @change="ownersChange(userForm.ownerVal)" :remote-method="copyFormRemoteMethod">
                    <el-option v-for="(item, index) in copyList" :key="index" :label="item" :value="item">
                    </el-option>
                  </el-select>
                </el-form-item>
                <div class="arch-button-container text-center">
                  <el-button class="arch-button-item" type="primary" size="mini" @click="submitForm(1)">确定</el-button>
                  <el-button class="arch-button-item" type="primary" size="mini" @click="visible = false;userForm.copyVal = '';">取消</el-button>
                </div>
              </el-form>
            </el-popover>
            <div class="pull-right">
              <el-button type="primary" class="title-buttom" @click="resetChecked">清空</el-button>
            </div>
          </div>
          <div class="competence-tree">
            <el-tree lazy :load="loadFunc" :data="competenceData" show-checkbox node-key="orgId" ref="tree" highlight-current @check-change="checkChange" :props="defaultProps" :check-strictly="true" :expand-on-click-node="false" :render-content="renderContent">
            </el-tree>
          </div>
          <span class="error" v-show="showTreeError">请选择权限</span>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="saveButtom" @click="submitForm(0)">保存</el-button>
        <el-button type="primary" class="saveButtom" @click="resetForm('userForm')">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import Vue from 'Vue'
  import Api from '@/services/permission';
  export default {
    data() {
      /**
       * [ownerRule owners校验规则]
       * @param  {[type]}   rule     [规则]
       * @param  {[type]}   value    [输入值]
       * @param  {Function} callback [返回值]
       * @return {[type]}            [正确,错误]
       */
      let ownerRule = (rule, value, callback) => {
        if (this.userList.length === 0) {
          callback(new Error('请输入登录名'));
        } else {
          callback();
        }
      }
      return {
        /**
         * [userForm 新建表单]
         * @type {Object}
         */
        isEdit: false,
        allLine: [],
        userForm: {
          circuit: '',
          business: '',
          ownerVal: '',
          copyVal: ''
        },
        userRules: {
          circuit: [{
            type: 'object',
            required: true,
            message: '请选择业务线',
            trigger: 'change'
          }],
          business: [{
            required: true,
            message: '请选择业务架构',
            trigger: 'change'
          }],
          ownerVal: [{
            required: true,
            validator: ownerRule,
            trigger: 'blur'
          }],
          copyVal: [{
            required: true,
            message: '请选择被复制人账号',
            trigger: 'change'
          }]
        },
        ownerList: [],
        userList: [],
        copyList: [],
        isOwner: true,
        checked: false,
        visible: false,
        showTreeError: false,
        competenceData: [],
        defaultProps: {
          children: 'sunList',
          label: 'orgName'
        },
        originCheckedArray: []
      }
    },
    methods: {
      /**
       * [submitForm 表单提交]
       * @param  {[type]} formName [表单名]
       * @return {[type]}          [成功/失败]
       */
      /**
       * type - 正常添加 0
       * type - 复制添加 1
       */
      getBrandCodeAndLineId() {
        return {
          userName: this.userList.join(','),
          lineId: this.userForm.circuit.id,
          brandCode: this.userForm.business
        }
      },
      async submitForm(type) {
        const validOfUserForm = await this.$refs['userForm'].validate()
          .catch(e => console.log(e));
        if (validOfUserForm) {
          const params = this.getBrandCodeAndLineId();
          if (type === 1) {
            const validOfCopyForm = await this.$refs['copyForm'].validate()
              .catch(e => console.log(e));
            if (validOfCopyForm) {
              params.copyUser = this.userForm.copyVal;
              if (this.isEdit) {
                let editCopyRight = await Api.editCopyRight(params)
                if (this.isNull(editCopyRight)) {
                  this.$router.push({
                    name: '用户管理'
                  })
                } else {}
              } else {
                let copyUserRight = await Api.copyUserRight(params)
                if (this.isNull(copyUserRight)) {
                  this.$router.push({
                    name: '用户管理'
                  })
                } else {}
              }
            }
          } else {
            // 处理 owners
            let checkedNodes = this.$refs.tree.getCheckedNodes()
            let nodeSet = new Set();
            checkedNodes.forEach(item => nodeSet.add(item.level))
            let size = nodeSet.size;
            if (!this.isEdit && !nodeSet.size) {
              return this.showTreeError = true;
            }
            if (size > 1) {
              return this.$alert('同一用户不能拥有跨级权限')
            }
            if (this.isEdit) {
              let resp = await Api.editUserRight(
                this.getBrandCodeAndLineId(),
                this.originCheckedArray,
                checkedNodes.map(item => item.orgId)
              )
              if (this.isNull(resp)) {
                this.$router.push({
                  name: '用户管理'
                })
              }
            } else {
              let infoId = checkedNodes.map(item => item.orgId).join(',')
              params.infoId = infoId
              let resp = await Api.createUserRight(params)
              if (this.isNull(resp)) {
                this.$router.push({
                  name: '用户管理'
                })
              }
            }
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      },
      resetForm(formName) {
        this.$router.push({
          name: '用户管理'
        })
        //this.$refs[formName].resetFields();
      },
      /**
       * [circuitChange 业务线选择事件]
       * @param  {[type]} circuit [当前选择项]
       * @return {[type]}         [数据权限数据/提示选择业务线]
       */
      async handleAccountAuth() {
        const validOfUserForm = await this.$refs['userForm'].validate()
          .catch(e => console.log(e));
        if (validOfUserForm) {
          this.visible = true
        }
      },
      circuitChange(circuit) {
        this.userForm.business = ''
      },
      /**
       * [businessChange 业务架构选择事件]
       * @param  {[type]} business [当前选择项]
       * @return {[type]}          [数据权限数据/提示选择业务线]
       */
      businessChange(business) {
        this.requestOaData(this.userForm.business, this.userForm.circuit)
      },
      /**
       * [requestOaData 如果业务线和业务架构都存在获取数据权限大树]
       * @param  {[type]} business [业务架构]
       * @param  {[type]} circuit  [业务线]
       * @return {[type]}          [数据权限数据/提示选择业务线]
       */
      async requestOaData() {
        const params = this.getBrandCodeAndLineId();
        const {
          brandCode,
          lineId,
          userName
        } = params
        if (this.isEdit) {
          if (brandCode && lineId && userName) {
            let treeData = await Api.editRootList(params)
            this.competenceData = (treeData && treeData.sunList) || [];
            this.setTreeCheck((treeData && treeData.sunList))
          }
        } else {
          // 可以选择登录名
          if (brandCode && lineId) {
            this.isOwner = false;
            let treeData = await Api.orgRoot(params)
            this.competenceData = (treeData && treeData.sunList) || [];
          }
        }
      },
      /**
       * [请求owner下拉框中的值]
       * @param  {[type]} query [下拉框中的值]
       * @return {[type]}       [58员工信息]
       */
      async remoteMethod(query) {
        if (query.length > 0) {
          let list = await Api.oaSearch({
            userName: query
          })
          if (this.isArray(list)) {
            this.ownerList = list
          }
        }
      },
      async copyFormRemoteMethod(query) {
        if (query.length > 0) {
          let list = await Api.copyUserList({
            userName: query,
            brandCode: this.userForm.business,
            lineId: this.userForm.circuit.id
          })
          if (this.isArray(list)) {
            this.copyList = list
          }
        }
      },
      async loadFunc(node, resolve) {
        const func = this.isEdit ? 'editSunList' : 'sunOrgList'
        const params = this.getBrandCodeAndLineId()
        params.parentId = node.data.orgId;
        let treeData = await Api[func](params)
        if (this.isArray(treeData)) {
          resolve(treeData)
        }
        if (this.isEdit) {
          this.setTreeCheck(treeData)
        }
      },
      /**@augments
       * 接受数据 - 设置节点选中 - 且用来记录原始选中节点
       */
      setTreeCheck(treeData) {
        let checkedArray = treeData && treeData.filter(item => {
          return +item.selectedFlag
        })
        if (checkedArray.length > 0) {
          Vue.nextTick(function() {
            checkedArray.forEach((item => {
              this.originCheckedArray.push(item.orgId)
              this.$refs.tree.setChecked(item, true)
            }))
          }, this)
        }
      },
      /**
       * [选择下拉框中的值]
       * @param  {[type]} value [选取58用户]
       * @return {[type]}       []
       */
      async ownersChange(value) {
        if (value) {
          // owner 存在即不再添加
          let flag = true
          this.userList.forEach((item) => {
            if (item == value) {
              flag = false
              return false
            }
          });
          if (flag) {
            let isExist = await Api.isExist({
              userName: value,
              brandCode: this.userForm.business,
              lineId: this.userForm.circuit.id
            })
            if (this.isNull(isExist)) {
              this.userList.push(value)
            } else {
              // TODO Erroe
            }
          }
        }
        this.$refs['userForm'].validateField('ownerVal')
        this.userForm.ownerVal = '';
      },
      /**
       * [删除权限人]
       * @param  {[type]} item [每一项信息]
       * @param  {[type]} value [当前索引]
       * @return {[type]}       []
       */
      userDelete(item, index) {
        this.userList.splice(index, 1)
        this.$refs['userForm'].validateField('ownerVal')
      },
      /**
       * [setCheckedKeys 数据权限全选]
       * @param {[type]} value [当前项]
       */
      setCheckedKeys(value) {},
      /**
       * [checkChange 选择checkbox]
       * @param  {[type]} data [当前节点所对应的对象]
       * @param  {[type]} key  [当前节点是否选中]
       * @param  {[type]} node [当前节点的子树是否有被选中的节点]
       * @return {[type]}      [新数据]
       */
      checkChange(data, key, node) {
        let checkedNodes = this.$refs.tree.getCheckedNodes()
        let nodeSet = new Set();
        checkedNodes.forEach(item => nodeSet.add(item.level))
        let size = nodeSet.size;
        if (!this.isEdit && !nodeSet.size) {
          return this.showTreeError = true;
        }
        if (!this.isEdit && nodeSet.size) {
          return this.showTreeError = false;
        }
      },
      resetChecked() {
        this.$refs.tree.setCheckedKeys([])
      },
      renderContent(h, {
        node,
        data,
        store
      }) {
        return ( <
          span class = {
            {
              'active': data.colourFlag
            }
          } > {
            node.label
          } < /span>
        );
      }
    },
    created: async function() {
      const route = this.$route;
      const path = route.path;
      this.name = route.name;
      let allLine = await Api.allLine();
      this.allLine = allLine;
      if (path === '/dataAuth/userUpdate') {
        const params = route.params;
        const keys = Object.keys(params)
        if (!keys.length) {
          return this.$router.push({
            name: '用户管理'
          })
        }
        const {
          userName,
          brandCode,
          lineId,
        } = params
        this.isEdit = true;
        this.userList.push(userName)
        this.userForm.circuit = allLine.find((item => item.id === lineId))
        this.userForm.business = brandCode;
        this.requestOaData()
      } else {}
    },
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  // 新增用户
  .userAdd .userList {
    margin-top: -5px;
    border: 1px solid #ebebeb;
    width: 388px;
    height: 140px;
    overflow: auto;
    border-radius: 7px;
    padding: 5px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  .userAdd .userList .user-people {
    border: 1px solid #ebebeb;
    border-radius: 5px;
    margin: 5px;
    padding: 4px 8px;
    font-size: 12px;
    color: #343434;
  }
  .userAdd .competence {
    border: 1px solid #ebebeb;
    width: 400px;
    overflow: auto;
    border-radius: 7px;
  }
  .userAdd .competence .competence-title {
    border-bottom: 1px solid #ebebeb;
    padding: 0 10px;
  }
  .userAdd .competence .competence-title .title-buttom {
    padding: 6px 7px;
    font-size: 12px;
    border-radius: 3px;
  }
  .userAdd .competence .competence-tree {
    padding: 10px 0;
    height: 500px;
    overflow: auto;
  }
  .arch-button-container {
    margin-top: 24px;
  }
  .arch-copy-title {
    padding: 10px;
    height: 20px;
    line-height: 20px;
    font-size: 16px;
    color: #fff;
    background-color: #3285a7
  }
  .arch-copy-from {
    padding-top: 30px;
    height: 120px;
  }
  span.active {
    color: #e74c3c!important;
  }
  .arch-button-container .arch-button-item {
    width: 124px;
    height: 30px;
  }
  .error {
    color: #fa5555;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
  }
</style>
