<template>
  <div>
    <h3 class="userTitle">权限查看</h3>
    <el-form ref="form" :model="select" label-width="100px">
      <el-form-item label="业务线">
        <el-select class="userSelect" v-model="select.businessLine" placeholder="请选择" value-key="id" @change="handleBusinessLineChange">
          <el-option v-for="(item, index) in select.businessLineData" :key="index" :label="item.lineName" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select class="userSelect" v-model="select.brandCode" placeholder="请选择" value-key="id" @change="handleBrandChange">
          <el-option v-for="(item, index) in select.businessLine.listBrand" :key="index" :label="item.brandName" :value="item.brandCode">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="导出权限列表" prop="competence">
        <el-row>
          <el-col :span="10" class="competenceList">
            <h5 class="competenceList-title">
              数据权限
            </h5>
            <div class="competenceList-info">
              <el-tree @node-click="handTreeNodeClick" lazy :load="loadFunc" :data="treeData" node-key="id" ref="tree" highlight-current :props="defaultProps" :expand-on-click-node="false">
              </el-tree>
            </div>
          </el-col>
          <el-col :span="10" class="competenceList">
            <h5 class="competenceList-title">
              用户
            </h5>
            <div class="competenceList-info">
              <el-input placeholder="请输入搜索条件" @change="searchValueChange" v-model="searchValue">
                <i slot="suffix" class="el-icon-search"></i>
              </el-input>
              <el-table class="user-table-striped" stripe :data="showData" style="width: 100%;">
                <el-table-column prop="userName" label="登录名(OA)">
                </el-table-column>
                <el-table-column prop="realName" label="中文名">
                </el-table-column>
              </el-table>
            </div>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item>
        <el-button class="saveButtom" type="primary" @click="exportOaList">导出</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import Api from '@/services/permission'
  export default {
    data() {
      return {
        select: {
          businessLine: '',
          businessLineData: [],
          brandCode: '',
          searchType: '',
          searchValue: ''
        },
        treeData: [],
        defaultProps: {
          children: 'sunList',
          label: 'orgName'
        },
        searchValue: '',
        tableData: [],
      }
    },
    computed: {
      showData() {
        if (this.tableData.length === 0) {
          return []
        }
        return this.tableData.filter(item => {
          return (item.realName.indexOf(this.searchValue) !== -1) || (item.userName.indexOf(this.searchValue) !== -1)
        })
      }
    },
    methods: {
      searchValueChange() {
      },
      exportOaList() {
        let currentNode = this.$refs.tree.getCurrentNode()
        if (!currentNode)
          return this.$alert('请选择部门')
        Api.export({
          infoId: currentNode.orgId,
          downType: 'userOa'
        })
      },
      handleBusinessLineChange() {
        this.select.brandCode = ''
        this.tableData = [];
      },
      async handTreeNodeClick({
        orgId
      }) {
        let resp = await Api.userOaList({
          infoId: orgId
        });
        if (this.isArray(resp)) {
          this.tableData = resp;
        }
      },
      async loadFunc(node, resolve) {
        let lineId = this.select.businessLine.id,
          brandCode = this.select.brandCode,
          parentId = node.data.orgId;
        if (lineId && brandCode && parentId) {
          let resp = await Api.sunOrgList({
            lineId,
            brandCode,
            parentId
          })
          if (this.isArray(resp)) {
            resolve(resp)
          }
        }
      },
      async handleBrandChange() {
        let lineId = this.select.businessLine.id,
          brandCode = this.select.brandCode;
        let resp = await Api.orgRoot({
          lineId,
          brandCode
        })
        this.treeData = (resp && resp.sunList) || [];
      }
    },
    created: async function() {
      let resp = await Promise.all([
        Api.allLine()
      ]);
      let allLine = resp[0];
      this.select.businessLineData = allLine
      if (allLine.length) {
        this.select.businessLine = allLine[0]
        if (allLine[0].listBrand && allLine[0].listBrand.length) {
          this.select.brandCode = allLine[0].listBrand[0].brandCode
          this.handleBrandChange()
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  //公用样式
  .pull-right {
    float: right;
  }
  .competenceList {
    width: 400px;
    border: 1px solid #ebebeb;
    border-radius: 7px;
  }
  .competenceList:first-child {
    margin-right: 20px;
  }
  .competenceList .competenceList-title {
    font-size: 14px;
    color: #bbb;
    background-color: #f9f9f9;
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
    padding-left: 15px;
    margin: 0 0px;
  }
  .competenceList .competenceList-info {
    padding: 10px 15px 0;
    height: 375px;
    overflow: auto;
    background-color: #fff;
  }
</style>
