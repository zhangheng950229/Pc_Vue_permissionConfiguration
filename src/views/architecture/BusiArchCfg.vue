<template>
  <div>
    <h2>{{name}}</h2>
    <el-form class="arch-form" ref="basicForm" :model="basicForm" :rules="basicRules" label-width="110px">
      <el-form-item label="业务架构名称" prop="archName">
        <el-input :disabled="basicForm.disabled" v-model="basicForm.archName" placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item label="业务线" prop="businessLineModel">
        <el-select :disabled="basicForm.disabled" v-model="basicForm.businessLineModel" placeholder="请选择" :style="{width: '100%'}" value-key="id">
          <el-option v-for="(item, index) in basicForm.businessLineData" :key="index" :label="item.lineName" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="品牌" prop="brandModel">
        <el-radio-group :disabled="basicForm.disabled" v-if="basicForm.businessLineModel.listBrand" v-model="basicForm.brandModel">
          <el-radio v-for="item in basicForm.businessLineModel.listBrand" :key="item.id" :label="item">{{ item.brandName }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button v-show="!basicForm.disabled" type="primary" @click="createArch">提交</el-button>
      </el-form-item>
    </el-form>
    <div class="arch-container clearfix">
      <div class="arch-box" :class="{high: business_high}" style="width:410px">
        <div class="arch-title"><b class="title-text">业务架构</b>
          <el-popover ref="arch-copy" placement="right" width="370" style="padding:0;" v-model="archCopyVisible">
            <div class="arch-copy-title">
              选择复制的业务架构对应品牌
              <span class="close fr" @click="archCopyVisible = false"></span>
            </div>
            <el-form class="arch-copy-from" ref="form" :model="copyForm">
              <el-form-item label-width="64px">
                <el-radio-group v-if="basicForm.businessLineModel.listBrand" v-model="copyForm.value">
                  <el-radio v-for="item in basicForm.businessLineModel.listBrand" :key="item.id" :label="item">{{ item.brandName }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <div class="arch-button-container text-center">
                <el-button class="arch-button-item" type="primary" size="mini" @click="archCopyVisible = false">确定</el-button>
                <el-button class="arch-button-item" type="info" size="mini" @click="archCopyVisible = false">取消</el-button>
              </div>
            </el-form>
          </el-popover>
          <el-button v-if="false" size="mini" class="fr" type="primary" v-popover:arch-copy>复制业务架构</el-button>
        </div>
        <div class="arch-tree">
          <tree ref="business_tree" :props="business_props" folderIcon boundIcon @node-drag-drop="business_drag_drop" @node-click="business_treeNodeClick" @operator-click="opeClick" :root='business_data' :drag-option='business_dragOption' edit lazy :loadFn="loadFn"
            :drag-end='organization_dragEnd' @edit-name-valid="businessEidt" :default-text='"新生成接点"' :hover-color='"#f5f7fa"' :operator-offset-x='30' :operator-offset-y='-20' :highlight-color='"green"'>
            <div slot="left">
              <div class="operator left" v-if="businessNode">
                <div class="operator-title">
                  <p>节点名称 : <span>{{businessNode.model.selfName}}</span></p>
                  <p>节点 ID : <span>{{businessNode.model.selfId}}</span></p>
                  <span class="close close-circle fr" @click="business_treeClose"></span>
                </div>
                <ol class="operator-list">
                  <li v-for="(item, idx) in businessBindList" :key="idx">
                    <p>{{idx + 1 + '.' + '部门名称: ' + item.orgName}}</p>
                    <p class="arch-tooltip">部门ID : ({{item.orgId}})</p>
                    <el-button class="unbind" size="mini" type="primary" @click.stop="nodeUnbind(0, businessNode.model, item)">解绑</el-button>
                  </li>
                </ol>
              </div>
            </div>
            <div slot="right">
              <ul class="operator right" @mouseout="handleRightOperatorOut">
                <li @mouseenter="operatorRight.addMenu = true" @mouseleave="operatorRight.addMenu = false">添加<span class="arrow fr"></span>
                  <ul v-show="operatorRight.addMenu" class="operator secondMenu">
                    <li data-method="handleBortherAdd">添加同级节点</li>
                    <li data-method="handleSingleAdd">添加子节点</li>
                  </ul>
                </li>
                <li @mouseenter="operatorRight.moveMenu = true" @mouseleave="operatorRight.moveMenu = false">移动<span class="arrow fr"></span>
                  <ul v-show="operatorRight.moveMenu" class="operator secondMenu">
                    <li data-method="handleMoveUp">向上移动</li>
                    <li data-method="handleMoveDown">向下移动</li>
                  </ul>
                </li>
                <li data-method="handleDelete">删除</li>
              </ul>
            </div>
          </tree>
          <el-dialog title="节点信息" :visible.sync="addForm.visible" width="50%">
            <el-form :model="addForm" ref="addForm" label-width="100px">
              <el-form-item v-for="(name, index) in addForm.names" :label="'节点名' + index" :key="name.key" :prop="'names.' + index + '.value'" :rules="{ required: true, message: '节点名不能为空', trigger: 'blur' }">
                <el-input v-model="name.value" style="width:90%"></el-input>
                <span v-if="index !== 0" class="arch-reduce" @click="handleRemoveNameInput(index)"></span>
              </el-form-item>
            </el-form>
            <div class="text-center">
              <span class="arch-add" @click="handleNodeNameInput"></span>
            </div>
            <div class="text-center">
              <el-button class="saveButtom" type="primary" @click="handleAddNodeSubmit">确 定</el-button>
              <el-button class="saveButtom" type="primary" @click="handleAddNodeCancel">取 消</el-button>
            </div>
          </el-dialog>
        </div>
      </div>
      <div class="arch-box">
        <div class="arch-title"><b class="arch-text">组织架构</b></div>
        <div class="arch-tree">
          <el-date-picker :clearable="false" @change="queryOrginizeTree()" ref="organizationMonth" class="arch-date-picker" v-model="organizationMonth" type="month" placeholder="选择日期">
          </el-date-picker>
          <tree ref="organization_tree" lazy :loadFn="queryOrginizeTree" @node-drag-start="organization_drag_start" @node-drag-drop="organization_drag_drop" :props='organization_props' @node-click="organization_treeNodeClick" @operator-click="opeClick" :root='organization_data'
            :operatorBound='operatorBound' :drag-option='organization_dragOption' :operator-offset-x='20' :operator-offset-y='-20' :drag-end='organization_dragEnd' :default-text='"新生成接点"' :hover-color='"#f5f7fa"' :operator-offset='20' :highlight-color='"green"'>
            <div slot="left">
              <div class="operator left" v-if="organizationNode">
                <div class="operator-title">
                  <p>节点名称 : <span>{{organizationNode.orgName}}</span></p>
                  <p>节点ID :
                    <span>{{organizationNode.orgId}}</span>
                  </p>
                  <span class="close close-circle fr" @click="business_treeClose"></span>
                </div>
                <ol class="operator-list">
                  <li v-for="(item, idx) in organizationBindList" :key="idx">
                    <p>{{idx + 1 + '.' + '部门名称: ' + item.busName}}</p>
                    <p class="arch-tooltip" style="display:inline-block">部门ID : {{item.busId}}</p>
                    <el-button class="unbind" size="mini" type="primary" @click.stop="nodeUnbind(1, organizationNode, item)">解绑</el-button>
                  </li>
                </ol>
              </div>
            </div>
          </tree>
        </div>
      </div>
    </div>
    <div class="arch-button-container">
      <el-button class="arch-button-item" size="medium" type="primary" style="marginRight:90px;" @click="archTreeSumit">提交</el-button>
      <router-link :to="{ name: '业务架构'}">
        <el-button class="arch-button-item" size="medium" type="primary">返回</el-button>
      </router-link>
    </div>
    <div class="arch-mapping-container" v-show="isDirty">
      <div class="arch-mapping-title">架构映射关系表</div>
      <div class="arch-mapping-selector">
        <el-date-picker @change="resetPageNumAndQueryMappingTableData" ref="mappingMonth" :clearable="false" v-model="mappingForm.date" type="month" placeholder="选择月"></el-date-picker>
      </div>
      <div class="arch-mapping-tabs">
        <el-tabs v-model="tabActiveName" @tab-click="resetPageNumAndQueryMappingTableData">
          <el-tab-pane label="按业务架构" name="bus">
          </el-tab-pane>
          <el-tab-pane label="按组织架构" name="org">
          </el-tab-pane>
        </el-tabs>
        <div class="arch-mapping-info" @keyup.enter="resetPageNumAndQueryMappingTableData">
          <el-form :inline="true" :model="mappingForm" class="demo-form-inline">
            <el-form-item label="部门级别">
              <el-select @change="resetPageNumAndQueryMappingTableData" v-model="mappingForm.level" placeholder="请选择" clearable>
                <el-option label="一级" value="1"></el-option>
                <el-option label="二级" value="2"></el-option>
                <el-option label="三级" value="3"></el-option>
                <el-option label="四级" value="4"></el-option>
                <el-option label="五级" value="5"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="部门名称">
              <el-input v-model="mappingForm.name" placeholder="请输入名称"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="mappinpExport">导出</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="arch-mapping-table">
          <el-table :data="mappingForm.tableTable" border>
            <el-table-column prop="comOrgName" label="部门名称" align="center" width="180">
            </el-table-column>
            <el-table-column prop="comOrgId" label="部门ID" align="center" width="200">
            </el-table-column>
            <el-table-column prop="comOrgFullPath" label="全路径" align="center" width="360">
            </el-table-column>
            <el-table-column prop="superComOrgName" label="上级部门" align="center">
            </el-table-column>
            <div v-if="tabActiveName === 'bus'">
              <el-table-column prop="bindComOrgName" label="绑定组织架构部门" align="center">
              </el-table-column>
            </div>
            <div v-if="tabActiveName === 'org'">
              <el-table-column prop="bindComOrgName" label="绑定业务架构部门" align="center">
              </el-table-column>
            </div>
            <el-table-column prop="bindComOrgFullPath" label="绑定部门全路径" align="center" width="360">
            </el-table-column>
            <el-table-column prop="month" label="组织架构版本" align="center" width="120">
            </el-table-column>
            <div v-if="tabActiveName === 'bus'">
              <el-table-column width="120" prop="isLast" label="是否末级部门" align="center">
              </el-table-column>
            </div>
          </el-table>
          <el-pagination class="arch-mapping-panigation" @size-change="handleSizeChange" @current-change="queryMappingTableData" :current-page.sync="mappingForm.pageNum" :page-sizes="[5, 10, 15, 20]" :page-size="mappingForm.pageSize" layout="total, sizes, prev, pager, next, jumper"
            :total="mappingForm.total">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from "Vue";
  import Tree from "@/components/Tree";
  import Api from "@/services/BusiArchCfg";
  const DELETECONFIRM = "注意：删除此节点会导致其下属所有子节点一并删除，统计模块的查询条件中将无法查看！";
  export default {
    components: {
      Tree: Tree
    },
    data() {
      return {
        structure: {},
        isDirty: false,
        basicForm: {
          disabled: false,
          archName: "",
          businessLineModel: "",
          businessLineData: [],
          brandModel: ""
        },
        basicRules: {
          archName: [{
              required: true,
              message: "请输入业务架构名称",
              trigger: "blur"
            },
            {
              max: 30,
              message: "长度不得超过30个字符",
              trigger: "blur"
            }
          ],
          businessLineModel: {
            type: "object",
            required: true,
            message: "请选择业务线",
            trigger: "change"
          },
          brandModel: {
            type: "object",
            required: true,
            message: "请选择品牌",
            trigger: "change"
          }
        },
        copyForm: {},
        addForm: {
          flag: 0,
          visible: false,
          names: [{
            value: "",
            key: Date.now()
          }]
        },
        operatorRight: {
          addMenu: false,
          moveMenu: false
        },
        tabActiveName: "bus",
        mappingForm: {
          date: Date.now(),
          departmentModel: "",
          input: "",
          pageNum: 1,
          pageSize: 5,
          tableTable: [],
          total: 10
        },
        archCopyVisible: false,
        mappingTableData: [],
        business_props: {
          name: "selfName",
          children: "children"
        },
        business_data: [],
        businessNode: null,
        businessAddList: [],
        businessBindList: [],
        business_high: false,
        business_dragOption: {
          draggable: false,
          highlight: true,
          style: {
            background: "#cff0ff",
            border: "1px solid #00b8ee",
            borderRadius: "4px"
          }
        },
        organizationMonth: Date.now(),
        organization_props: {
          name: "orgName",
          children: "children"
        },
        organization_data: [],
        organizationNode: null,
        organizationBindList: [],
        organizationDragStartNode: null,
        organization_dragOption: {
          draggable: true
        },
        organization_dragEnd: function() {
          this.business_high = false;
        }.bind(this),
        operatorBound: {
          width: 450,
        }
      };
    },
    methods: {
      getMonth(name) {
        return new Date(this.organizationMonth)
          .format("yyyy-MM")
          .replace("-", "");
      },
      async handleAddNodeSubmit() {
        let isValid = await this.$refs.addForm
          .validate()
          .catch(e => console.log(e));
        if (!isValid) return;
        /**
         * this.addForm.flag 
         *  0 ---- 添加子节点
         *  1 ==== 添加同级节点
         */
        let parentNode, params;
        const flag = this.addForm.flag;
        const isTree = this.businessNode.$parent.isTree;
        if (flag && isTree) {
          params = {
            level: 1,
            businessId: this.structure.businessLongId
          };
        } else {
          parentNode = flag ?
            this.businessNode.$parent.model :
            this.businessNode.model;
          // const orders = flag ? this.businessNode.model.orders : null;
          const {
            businessLongId: businessId,
            selfId: parentSelfId,
            selfName: parentSelfName,
            level: parentLevel
          } = parentNode;
          params = {
            // orders,
            businessId,
            parentSelfId,
            parentSelfName,
            parentLevel,
            level: +parentLevel + 1
          };
        }
        // 将要建立的节点级别
        let _level = params.level,
          _parentSelfId = params.parentSelfId || ''
        console.log(_level, _parentSelfId);
        let toCheckList = [
          ...new Set(this.addForm.names
            .filter(item => item.value)
            .map(item => item.value))
        ]
        // params.selfName = [
        //   ...new Set(this.addForm.names
        //     .filter(item => item.value)
        //     .map(item => item.value))
        // ].join(',')
        let submitList = this.checkAddNodeName(_level, _parentSelfId, toCheckList)
        if (!submitList.length) {
          return this.$alert("已经存在同级同名节点");
        }
        params.selfName = submitList.join(',')
        let resp = await Api.addBus(params);
        // TODO ERROR HANDLE
        if (this.isNull(resp)) {
          return this.$alert("已经存在同级同名节点");
        }
        if (this.isArray(resp)) {
          // 缓存新增节点
          this.businessAddList.push(...resp);
          // 重新刷新节点树
          if (flag && isTree) {
            this.business_data.push(...resp);
          } else {
            if (flag) {
              // 增加同级节点 - 且非根节点
              this.businessNode.$parent.addChild(...resp);
            } else {
              // 增加子节点
              this.businessNode.model.isHasSon = "1";
              this.businessNode.addChild(...resp);
            }
          }
          this.addForm.names = [{
            value: "",
            key: Date.now()
          }];
          this.addForm.visible = false;
        }
      },
      checkAddNodeName(level, parentSelfId, nameList) {
        let compareArray = this
          .businessAddList
          .filter(item => +item.level === level &&
            parentSelfId === item.parentSelfId)
          .map(item => item.selfName)
        return nameList.filter(item => {
          let flag = true
          compareArray.forEach(_item => {
            if (_item === item) {
              flag = false
            }
          })
          return flag
        })
      },
      handleAddNodeCancel() {
        this.addForm.names = [{
          value: "",
          key: Date.now()
        }];
        this.addForm.visible = false;
      },
      handleRemoveNameInput(index) {
        this.addForm.names.splice(index, 1);
      },
      handleNodeNameInput() {
        this.addForm.names.push({
          value: "",
          key: Date.now()
        });
      },
      async createArch() {
        let isValid = await this.$refs.basicForm
          .validate()
          .catch(e => console.log(e));
        if (isValid) {
          const businessName = this.basicForm.archName;
          const {
            id: lineId,
            lineName
          } = this.basicForm.businessLineModel;
          const {
            brandCode,
            brandName
          } = this.basicForm.brandModel;
          let params = {
            businessName,
            lineId,
            lineName,
            brandCode,
            brandName
          };
          this.queryOrginizeTree();
          let resp = await Api.createArch(params);
          if (this.isObject(resp)) {
            this.structure = resp.getLongId;
            this.basicForm.disabled = true;
            let longId = resp.getLongId.businessLongId;
            let root = resp.root;
            this.business_data.push(root);
          } else {
            this.$alert(resp);
          }
        }
      },
      async business_drag_drop(ev, addFunc, removeFunc, VN) {
        if (this.organizationDragStartNode) {
          const month = this.getMonth("organizationMonth");
          const {
            selfId: busId,
            selfName: busName
          } = VN.model;
          const {
            orgId,
            orgName
          } = this.organizationDragStartNode;
          let addBind = await Api.addBind({
            busId,
            busName,
            orgId,
            orgName,
            month
          });
          if (this.isNull(addBind)) {
            VN.model.bound = "1";
            this.$alert("绑定成功");
          }
        }
      },
      async businessEidt(VN, resolve, reject) {
        let model = VN.model;
        let {
          selfId,
          selfName: _selfName
        } = model;
        let selfName = VN.form._name;
        if (selfName !== _selfName) {
          let updateBusName = await Api.updateBusName({
            selfName,
            selfId
          });
          if (this.isArray(updateBusName)) {
            resolve();
          } else {
            reject();
          }
        } else {
          resolve();
        }
      },
      business_treeClose() {
        this.$refs.organization_tree.doHide();
        this.$refs.business_tree.doHide();
      },
      async business_treeNodeClick(ev, addfunc, removeFunc, VN) {
        this.businessNode = VN;
        let type = ev.button ? "right" : "left";
        if (type === "left") {
          const month = this.getMonth("organizationMonth");
          const busId = VN.model.selfId;
          let bindRelation = await Api.bindRelation({
            month,
            busId
          });
          if (this.isArray(bindRelation)) {
            this.businessBindList = bindRelation;
          }
        }
        this.$refs.business_tree.doShow(type);
      },
      /**@augments
       * 0 -- business
       * 1 -- organization
       */
      async nodeUnbind(type, node, item) {
        if (item) {
          const {
            month,
            busId,
            orgId
          } = item;
          let delBind = await Api.delBind({
            month,
            busId,
            orgId
          });
          if (this.isNull(delBind)) {
            let name = type ? "organizationBindList" : "businessBindList";
            let bindList = this[name];
            this[name] = bindList.filter(i => i !== item);
            node.bound = this[name].length === 0 ? "0" : "1";
          }
        }
      },
      async organization_treeNodeClick(ev, addfunc, removeFunc, VN) {
        this.organizationNode = VN.model;
        let type = ev.button ? "right" : "left";
        if (type === "left") {
          const month = this.getMonth("organizationMonth");
          const orgId = VN.model.orgId;
          let bindRelation = await Api.bindRelation({
            month,
            orgId
          });
          if (this.isArray(bindRelation)) {
            this.organizationBindList = bindRelation;
          }
        }
        this.$refs.organization_tree.doShow(type);
      },
      organization_drag_start(ev, addfunc, removeFunc, VN) {
        this.organizationDragStartNode = VN.model;
        this.business_high = true;
      },
      organization_drag_drop(ev, addfunc, removeFunc, VN) {
        this.business_high = false;
      },
      opeClick(ev, addfunc, removeFunc, model) {
        let method = ev.target.getAttribute("data-method");
        this[method] && this[method](addfunc, removeFunc, model);
      },
      async loadFn(VN, resolve, reject) {
        let model = VN.model;
        let subBus = await Api.getSubBus({
          selfId: model.selfId,
          month: this.getMonth("organizationMonth")
        });
        resolve(subBus);
      },
      async queryOrginizeTree(VN, resolve, reject) {
        let orgId = VN ? VN.model.orgId : 0;
        const month = this.getMonth();
        let getSubOrg = await Api.getSubOrg({
          orgId,
          month
        });
        if (this.isArray(getSubOrg)) {
          if (resolve) {
            return resolve(getSubOrg);
          }
          this.organization_data = [];
          Vue.nextTick(() => {
            this.organization_data = getSubOrg;
          }, this);
        } else {}
      },
      async handleBortherAdd() {
        this.addForm.flag = 1;
        this.addForm.visible = true;
        this.$refs.business_tree.doHide();
      },
      async handleSingleAdd() {
        this.addForm.flag = 0;
        this.addForm.visible = true;
        this.$refs.business_tree.doHide();
      },
      /**@augments
       * to -- 0 -- 'up'
       * to -- 1 -- 'down'
       */
      async _handleMove(to) {
        const model = this.businessNode.model;
        const isTree = this.businessNode.$parent.isTree;
        const params = {};
        // RootBus
        params.selfId = model.selfId;
        params.selfName = model.selfName;
        params.oldOrder = model.orders;
        if (!isTree) {
          params.parentSelfId = model.parentSelfId;
          params.parentSelfName = model.parentSelfName;
        }
        params.newOrder = +params.oldOrder + (to ? 1 : -1);
        let updateBusOrder = await Api.updateBusOrder(params);
        if (this.isArray(updateBusOrder)) {
          // 刷新节点树
          if (!isTree) {
            this.businessNode.$parent.model.children = updateBusOrder;
          } else {
            this.business_data = updateBusOrder;
          }
        }
      },
      async handleMoveUp() {
        this._handleMove(0);
      },
      async handleMoveDown() {
        this._handleMove(1);
      },
      async handleDelete() {
        let businessNode = this.businessNode;
        this.$confirm(DELETECONFIRM, {
          // 消失前触发 阻塞消失
          beforeClose: async(action, instance, done) => {
            if (action === "cancel") {
              done();
            } else {
              let params;
              let isRootBus = businessNode.$parent.isTree;
              const selfId = businessNode.model.selfId;
              if (isRootBus) {
                params = {
                  selfId
                };
              } else {
                const {
                  level,
                  parentSelfId
                } = businessNode.model;
                params = {
                  selfId,
                  parentSelfId,
                  parentLevel: +level - 1
                };
              }
              let rootBus = this.business_data;
              if (isRootBus && rootBus.length === 1) {
                done();
                return this.$message("请勿删除最后一个根节点");
              }
              let delBus = await Api.delBus(params);
              if (this.isNull) {
                /**@augments
                 * 处理图标
                 * 决定刷新家那一级数据
                 */
                businessNode.removeChild(businessNode.model.selfId);
                if (!isRootBus) {
                  let $parent = businessNode.$parent,
                    model = $parent.model;
                  if (!model.children.length) {
                    model.isHasSon = "0";
                  }
                }
                done();
              }
            }
          }
        });
      },
      async refreshBusinessRootData() {
        let getRootBus = await Api.getRootBus({
          businessId: this.structure.businessLongId,
          month: this.getMonth("organizationMonth")
        });
        if (this.isArray(getRootBus)) {
          this.business_data = getRootBus;
        } else {
          this.$alert(getRootBus);
        }
      },
      handleRightOperatorOver(ev) {},
      handleRightOperatorOut(ev) {},
      handleTabClick() {},
      mappinpExport() {
        const params = this.getQueryMappingParams();
        Api.export(params);
      },
      handleSizeChange(pageSize) {
        this.mappingForm.pageSize = pageSize;
        this.mappingForm.pageNum = 1;
        this.queryMappingTableData();
      },
      async archTreeSumit() {
        let selfId = this.businessAddList.map(item => item.selfId).join(",");
        let updateStatus = await Api.updateStatus({
          selfId
        });
        if (this.isNull(updateStatus)) {
          this.isDirty = true;
          this.$message("提交成功");
          this.queryMappingTableData();
        }
      },
      getQueryMappingParams() {
        const month = new Date(this.mappingForm.date)
          .format("yyyy-MM")
          .replace("-", "");
        const {
          name,
          level,
          pageSize,
          pageNum
        } = this.mappingForm;
        const type = this.tabActiveName;
        return {
          month,
          name,
          level,
          pageSize,
          pageNum,
          type,
          businessId: this.structure.businessLongId
        };
      },
      resetPageNumAndQueryMappingTableData() {
        this.mappingForm.pageNum = 1;
        this.queryMappingTableData();
      },
      async queryMappingTableData() {
        const params = this.getQueryMappingParams();
        let tableOfRelation = await Api.tableOfRelation(params);
        if (this.isObject(tableOfRelation)) {
          let tableData = tableOfRelation.list;
          let total = tableOfRelation.total;
          this.mappingForm.tableTable = tableData;
          this.mappingForm.total = total;
        }
      }
    },
    created: async function() {
      const route = this.$route;
      const path = route.path;
      this.name = route.name;
      let allLine = await Api.allLine();
      this.basicForm.businessLineData = allLine;
      if (path === "/buisArch/update") {
        this.queryOrginizeTree();
        const params = route.params;
        const keys = Object.keys(params);
        if (!keys.length) {
          return this.$router.push({
            name: "业务架构"
          });
        }
        const {
          businessName,
          brandCode,
          businessLongId,
          lineId
        } = params;
        this.structure.businessLongId = businessLongId;
        this.basicForm.archName = businessName;
        this.basicForm.businessLineModel = allLine.find(
          item => item.id === lineId
        );
        this.basicForm.brandModel = this.basicForm.businessLineModel.listBrand.find(
          item => item.brandCode === brandCode
        );
        this.basicForm.disabled = true;
        let getRootBus = await Api.getRootBus({
          month: this.getMonth("organizationMonth"),
          businessId: businessLongId
        });
        if (this.isArray(getRootBus)) {
          this.business_data = getRootBus;
        } else {
          this.$alert(getRootBus);
        }
      } else {}
    }
  };
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .arch-form {
    width: 510px;
  }
  .arch-button-container {
    .arch-button-item {
      width: 124px;
      height: 30px;
      line-height: 8px;
      span {
        line-height: 8px;
        vertical-align: top;
      }
    }
  }
  .arch-container {
    padding-left: 88px;
    margin-bottom: 24px;
  }
  .arch-copy-title {
    padding: 10px;
    height: 20px;
    line-height: 20px;
    font-size: 16px;
    color: #fff;
    background-color: #3285a7;
  }
  .arch-copy-from {
    padding-top: 30px;
    height: 120px;
  }
  .arch-box {
    float: left;
    width: 460px;
    height: 430px;
    margin: 0 10px;
    border: 1px solid #ebebeb;
    border-radius: 3px;
    transition: 0.2s;
    background-color: #fff;
    &.high {
      box-shadow: 0 0 30px 0 #00b7f0;
    }
    .arch-title {
      height: 32px;
      line-height: 32px;
      background: #f9f9f9;
      padding: 6px 10px;
    }
    .arch-tree {
      position: relative;
      overflow: auto;
      height: 388px;
    }
    .arch-date-picker {
      width: 430px;
      margin: 12px 12px 0;
    }
    .operator {
      width: 120px;
      .operator-title {
        padding: 10px 10px 4px 12px;
        height: 36px;
        line-height: 18px;
        border-bottom: 1px solid #ccc;
         :nth-child(1) {
          margin-right: 0px;
        }
        .triangle-facing-left {
          position: absolute;
          left: -6px;
          top: 18px;
          width: 12px;
          height: 12px;
          border-top: 2px solid #ebebeb;
          border-left: 2px solid #ebebeb;
          border-radius: 2px;
          -webkit-transform: rotate(-45deg);
          transform: rotate(-45deg);
          background: #fff;
        }
        .close {
          position: absolute;
          right: 12px;
          top: 16px;
        }
      }
      .operator-list {
        max-height: 200px;
        overflow: auto;
        margin-top: 12px;
        li {
          position: relative;
          .unbind {
            position: absolute;
            top: 8px;
            right: 8px;
          }
        }
      }
      &.right {
        li {
          position: relative;
          padding: 0 8px 0 16px;
          height: 36px;
          line-height: 36px;
          .arrow {
            margin-top: 11px;
          }
          &:hover {
            background-color: #bcddf1;
          }
        }
        .secondMenu {
          position: absolute;
          top: -8px;
          left: 100%;
          background: #fff;
        }
      }
      &.left {
        width: 450px;
        font-size: 12px;
        li:nth-child(even) {
          background: #f5fcff;
        }
        li {
          padding: 4px 12px 8px;
          line-height: 20px;
          button {
            border: none;
          }
        }
      }
      border: 1px solid #ebebeb;
      border-radius: 3px;
      -webkit-transition: 0.2s;
      transition: 0.2s;
      box-shadow: 0 0 10px 0px #ccc;
    }
  }
  .arch-mapping-container {
    margin-top: 38px;
    border: 1px solid #ebebeb;
    border-radius: 3px;
    .arch-mapping-title {
      padding: 8px 12px;
      height: 16px;
      line-height: 16px;
      font-size: 16px;
      background-color: #f9f9f9;
    }
    .arch-mapping-selector {
      height: 52px;
      padding: 13px 0 2px 14px;
      border-top: 1px solid #ebebeb;
      border-bottom: 1px solid #ebebeb;
    }
    .arch-mapping-info {
      padding: 4px 12px 0;
    }
    .arch-mapping-panigation {
      text-align: center;
      padding: 24px 0 30px;
    }
  }
  .arch-tooltip {
    text-indent: 9px
  }
  .arch-add {
    display: inline-block;
    width: 27px;
    height: 25px;
    background: url('../../assets/add.png')
  }
  .arch-reduce {
    display: inline-block;
    vertical-align: middle;
    width: 27px;
    height: 25px;
    background: url('../../assets/decrease.png')
  }
</style>