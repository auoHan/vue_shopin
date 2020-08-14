<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 警告区域 -->
      <el-row>
        <el-col>
          <el-alert
            title="注意！只允许为第三级分类设置相关参数！"
            type="warning"
            show-icon
            :closable="false"
          >
          </el-alert>
        </el-col>
      </el-row>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            expand-trigger="hover"
            v-model="selectedKeys"
            :options="catelist"
            :props="cascaderProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="small"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                  <!-- 添加的按钮 -->
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <!-- 参数名称列 -->
            <el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作">
              <!-- 操作列 -->
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="small"
                  class="el-icon-setting"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  size="small"
                  class="el-icon-delete"
                  @click="
                    removeParamsById(scope.row.attr_id, scope.row.attr_name)
                  "
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="small"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                  <!-- 添加的按钮 -->
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <!-- 属性名称列 -->
            <el-table-column
              prop="attr_name"
              label="属性名称"
            ></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作">
              <!-- 操作列 -->
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="small"
                  class="el-icon-setting"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  size="small"
                  class="el-icon-delete"
                  @click="
                    removeParamsById(scope.row.attr_id, scope.row.attr_name)
                  "
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加参数对话框 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        @submit.native.prevent
        @keyup.enter.native="addParams"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addParams" native-type="submit"
          >确 定</el-button
        >
        <el-button @click="addDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 添加参数对话框 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
        @submit.native.prevent
        @keyup.enter.native="editParams"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editParams" native-type="submit"
          >确 定</el-button
        >
        <el-button @click="editDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "params",
  data() {
    return {
      catelist: [],
      //选中的父级分类的Id数组
      selectedKeys: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //被激活的页签的名称
      activeName: "many",
      // 动态参数的所有数据
      manyTableData: [],
      // 静态属性的所有数据
      onlyTableData: [],
      // 添加弹框是否隐藏
      addDialogVisible: false,
      //添加参数列表数据对象
      addForm: {
        attr_name: "",
      },
      //定义要添加的属性规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数", trigger: "blur" },
          {
            pattern: /[\u4e00-\u9fa5_a-zA-Z]{2,10}/,
            message: "参数的长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      // 修改弹框是否隐藏
      editDialogVisible: false,
      // 修改参数列表数据对象
      editForm: {
        attr_name: "",
      },
      //定义要修改的属性规则
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数", trigger: "blur" },
          {
            pattern: /[\u4e00-\u9fa5_a-zA-Z]{2,10}/,
            message: "参数的长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {
    //判断按钮是否需要被禁用
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) return true;
      return false;
    },
    //当前选中的三级分类id
    cateId() {
      if (this.selectedKeys.length === 3) return this.selectedKeys[2];
      return null;
    },
    //动态计算标题的文本
    titleText() {
      if (this.activeName === "many") return "动态参数";
      return "静态属性";
    },
  },
  watch: {},
  methods: {
    //获取商品分类级联数据列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      console.log(res);
      this.catelist = res.data;
    },
    //级联选择框选中项变化，会触发这个函数
    handleChange() {
      this.getParamsData();
    },
    //tab页签点击事件的处理函数
    handleTabClick() {
      //console.log(this.activeName);
      this.getParamsData();
    },
    //获取商品分类参数列表
    async getParamsData() {
      //console.log(this.selectedKeys);
      //根据所选分类的id和当前所属的面板获取到对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );
      if (res.meta.status !== 200) return this.$message.error("获取数据失败！");
      //console.log(res);

      //循环res.data拿到每一个值，将attr_vals字符串切割成数组重新赋值给attr_vals
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals !== "" ? item.attr_vals.split(" ") : [];
        //控制每一个item的文本框的显示与隐藏
        item.inputVisible = false;
        //控制文本框中的值
        item.inputValue = "";
      });
      console.log(res.data);
      //判断被激活的便签页名称，再将数据进行单独渲染
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    // 当关闭添加对话框时回显到初始值
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //提交添加表单
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
        this.$message.success("添加成功！");
        this.getParamsData();
        this.addDialogVisible = false;
      });
    },
    //点击编辑按钮弹出对话框
    async showEditDialog(attrId) {
      const {
        data: res,
      } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        { params: { sel: this.activeName } }
      );
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    editDialogClosed() {
      this.$refs.editFormRules.resetFields();
    },
    //点击编辑按钮提交修改信息
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const {
          data: res,
        } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        );
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.$message.success("修改成功！");
        this.getParamsData();
        this.editDialogVisible = false;
      });
    },
    //根据id删除对应的参数
    async removeParamsById(attrId, attrName) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除" + attrName + ", 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      //console.log(confirmResult);
      if (confirmResult !== "confirm")
        return this.$message.info("已经取消删除！");
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.$message.success("删除成功！");
      this.getParamsData();
    },
    //文本框失去焦点或者按下回车键会触发的函数
    handleInputConfirm(row) {
      // console.log("ok");
      //trim去除字符串两边的空格
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      //如果没有return，则证明输入的值是合法的，进行下一步操作
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      this.saveAttrVals(row);
    },
    //将对attr_vals的操作，保存到数据库
    async saveAttrVals(row) {
      //通过发起请求把数据存入数据库进行持久化存储
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      console.log(res.data);
      this.$message.success("修改数据成功！");
    },
    //删除对应的参数可选项
    handleClose(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttrVals(row);
    },
    //点击按钮显示输入文本框
    showInput(row) {
      row.inputVisible = true;
      //$nextTick方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
  },
  created() {
    this.getCateList();
  },
  mounted() {},
  beforeCreate() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  activated() {},
  components: {},
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin-top: 15px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 130px;
}
</style>
