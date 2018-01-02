<template>
  <div>
    <h2>业务架构</h2>
    <div class="arch-add">
      <router-link :to="{ name: '创建业务架构'}">
        <el-button class="arch-button" type="primary">创建业务架构</el-button>
      </router-link>
    </div>
    <el-table class="table" :data="tableData" border>
      <el-table-column prop="id" label="序号" align="center">
      </el-table-column>
      <el-table-column prop="businessName" label="业务架构名称" align="center">
      </el-table-column>
      <el-table-column prop="businessLongId" label="业务架构ID" align="center" width="285px">
      </el-table-column>
      <el-table-column prop="lineName" label="业务线" align="center">
      </el-table-column>
      <el-table-column prop="brandName" label="品牌" align="center">
      </el-table-column>
      <el-table-column prop="createName" label="创建人" align="center">
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center">
      </el-table-column>
      <el-table-column prop="updateName" label="修改人" align="center">
      </el-table-column>
      <el-table-column prop="updateTime" label="修改时间" align="center">
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
                <router-link :to="{ name: '配置业务架构', params: scope.row }">
                      <el-button type="text" size="small">编辑</el-button>
                </router-link>
                      <el-button @click="handleColumnDel(scope.row)" type="text" size="small">删除</el-button>
</template>
      </el-table-column>
    </el-table>
    <el-pagination class="panigation" @size-change="handleSizeChange" @current-change="updateTable" :current-page.sync="pageNum" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </div>
</template>

<script>
  import Api from '@/services/BusiArchCfg'
  export default {
    data() {
      return {
        pageNum: 1,
        pageSize: 5,
        total: 10,
        tableData: [],
      }
    },
    methods: {
      handleSizeChange(pageSize) {
        this.pageSize = pageSize;
        this.updateTable()
      },
      async handleColumnDel(row) {
        let isConfirm = await this.$confirm('确定要删除该业务架构吗？').catch(e => e)
        if (isConfirm === 'confirm') {
          let longId = row.businessLongId;
          let resp = await Api.delStructure({
            businessId: longId
          })
          if (this.isNull(resp)) {
            this.updateTable()
            this.$alert('删除成功')
          } else {
            this.$alert(resp)
          }
        }
      },
      getQueryParams() {
        const {
          pageNum,
          pageSize
        } = this;
        return {
          pageNum,
          pageSize
        }
      },
      async updateTable() {
        let resp = await Api.pageStructure(this.getQueryParams())
        if (this.isObject(resp)) {
          this.total = resp.total;
          this.tableData = resp.list;
        }
      }
    },
    async created() {
      this.updateTable()
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .arch-add {
    margin: 24px 0 16px 12px;
  }
  .arch-button {
    width: 130px;
    height: 32px;
    line-height: 8px;
  }
  .panigation {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
  }
</style>

