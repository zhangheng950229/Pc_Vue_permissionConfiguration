<template>
  <div @keyup.enter.stop="resetPageAndUpdateTable">
    <h3 class="userTitle">用户管理</h3>
    <el-form :inline="true" ref="form" :model="select" label-width="100px">
      <el-form-item label="业务线">
        <el-select clearable class="userSelect" v-model="select.businessLine" placeholder="请选择" value-key="id" @change="handleBusinessLineChange">
          <el-option v-for="(item, index) in select.businessLineData" :key="index" :label="item.lineName" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select class="userSelect" v-model="select.brand" placeholder="请选择" value-key="id" clearable @change="resetPageAndUpdateTable">
          <el-option v-for="(item, index) in select.businessLine.listBrand" :key="index" :label="item.brandName" :value="item.brandCode">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="搜索类别">
        <el-select v-model="select.searchType" placeholder="请选择搜索类别" class="userSelect" clearable @change="resetPageAndUpdateTable">
          <el-option label="登录名" value="userName"></el-option>
          <el-option label="中文名" value="realName"></el-option>
          <el-option label="操作人" value="operatorOa"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="搜索值">
        <el-input class="userSelect" v-model="select.searchValue" placeholder="请输入"></el-input>
      </el-form-item>
    </el-form>
    <router-link :to="{ path: 'userAdd', params: {} }">
      <el-button type="primary" class="saveButtom">新增</el-button>
    </router-link>
    <el-button type="primary" class="saveButtom" style="marginLeft:22px" @click="exportUserList">导出</el-button>
    <el-table class="table" :data="tableData" @sort-change="handleTableSort" border>
      <el-table-column prop="lineName" sortable label="业务线" align="center">
      </el-table-column>
      <el-table-column prop="businessName" sortable label="业务架构" align="center">
      </el-table-column>
      <el-table-column prop="userName" sortable label="登录名" align="center">
      </el-table-column>
      <el-table-column prop="realName" sortable label="中文名" align="center">
      </el-table-column>
      <el-table-column prop="operatorOa" sortable label="操作人" align="center">
      </el-table-column>
      <el-table-column prop="createTime" sortable label="创建时间" align="center">
      </el-table-column>
      <el-table-column prop="modifyTime" sortable label="修改时间" align="center">
      </el-table-column>
      <el-table-column prop="orgName" sortable label="最高权限部门" align="center">
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="scope">
                    <router-link :to="{ name: '编辑用户', params: scope.row }">
                      <el-button type="text" size="small">编辑</el-button>
                    </router-link>
                    <el-button @click="handleDelete(scope.row)" type="text" size="small">删除</el-button>
</template>
      </el-table-column>
    </el-table>
    <el-pagination class="user-pagination" @size-change="handleSizeChange" @current-change="updateTable" :current-page.sync="currentPage" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </div>
</template>

<script>
  import Api from '@/services/permission';
  export default {
    data() {
      return {
        sortType: '',
        isAsc: '',
        select: {
          businessLine: '',
          businessLineData: [],
          brand: '',
          searchType: '',
          searchValue: ''
        },
        tableData: [],
        pageSize: 5,
        total: 10,
        currentPage: 1
      }
    },
    methods: {
      handleTableSort({
        column,
        prop,
        order
      }) {
        this.sortType = prop || '';
        this.isAsc = order ? order === 'ascending' ? 'asc' : 'desc'  : ''
        this.updateTable()
      },
      handleBusinessLineChange() {
        this.select.brand = ''
        this.resetPageAndUpdateTable()
      },
      resetPageAndUpdateTable() {
        this.currentPage = 1;
        this.updateTable()
      },
      async handleDelete(row) {
        let resp = await Api.deleteUser({
          brandCode: row.brandCode,
          lineId: row.lineId,
          userName: row.userName
        });
        console.log({
          brandCode: row.brandCode,
          lineId: row.lineId,
          userName: row.userName
        }, row);
        if (this.isNull(resp)) {
          this.updateTable();
        } else {
          this.$alert(resp);
        }
      },
      handleCurrentChange() {},
      handleSizeChange(pageSize) {
        this.pageSize = pageSize;
        this.updateTable()
      },
      getQueryParams() {
        const {
          sortType,
          isAsc,
          currentPage: currPage,
          pageSize,
          select
        } = this;
        const params = {
          sortType,
          isAsc,
          currPage,
          pageSize
        }
        if (select.businessLine) {
          params.lineId = select.businessLine.id
          if (select.brand) {
            params.brandCode = select.brand
          }
        }
        if (select.searchType && select.searchValue) {
          params[select.searchType] = select.searchValue
        }
        // TODO businessLine -- brand
        return params
      },
      async updateTable() {
        let tableData = await Api.userInfo(this.getQueryParams());
        this.total = tableData.total
        this.tableData = tableData.list
      },
      exportUserList () {
        let params = this.getQueryParams();
        Api.export({
          downType: 'userTable',
          isAsc: params.isAsc,
          sortType: params.sortType
        })
      }
    },
    created: async function() {
      let resp = await Promise.all([
        Api.allLine(),
        Api.userInfo(this.getQueryParams())
      ]);
      let allLine = resp[0],
        tableData = resp[1];
      this.select.businessLineData = allLine
      this.total = tableData.total
      this.tableData = tableData.list
    }
  }
</script>

