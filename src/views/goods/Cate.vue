<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 显示是否有效列 -->
        <template v-slot:isok="scope">
          <i
            class="el-icon-success"
            v-if="!scope.row.cat_deleted"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序列 -->
        <template v-slot:order="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template v-slot:opt="scope">
          <el-button
            type="primary"
            size="small"
            class="el-icon-setting"
            @click="showEditDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="small"
            class="el-icon-delete"
            @click="removeCateById(scope.row.cat_id, scope.row.cat_name)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 添加分类的弹框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="100px"
          @keyup.enter.native="addCate"
        >
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <!-- options 用来指定数据源 -->
            <!-- props 用来指定配置对象 -->
            <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChange"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="addCate" native-type="submit"
            >确 定</el-button
          >
          <el-button @click="addDialogVisible = false">取 消</el-button>
        </span>
      </el-dialog>

      <!-- 编辑弹框 -->
      <el-dialog
        title="编辑"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="80px"
          @submit.native.prevent
          @keyup.enter.native="editCate"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="editCate" native-type="submit"
            >确 定</el-button
          >
          <el-button @click="editDialogVisible = false">取 消</el-button>
        </span>
      </el-dialog>

      <!-- 分页区域 -->
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        layout="total, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "cate",
  data() {
    return {
      //定义获取商品分类数据列表要传入的参数对象
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //商品分类数据表的所有参数
      catelist: [],
      //父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
      },
      //选中的父级分类的Id数组
      selectedKeys: [],
      //总数据条数
      total: 0,
      //为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          //表示将当前列定义为模板列
          type: "template",
          //表示当前这一列使用的模板名称
          template: "isok",
        },
        {
          label: "排序",
          //表示将当前列定义为模板列
          type: "template",
          //表示当前这一列使用的模板名称
          template: "order",
        },
        {
          label: "操作",
          //表示将当前列定义为模板列
          type: "template",
          //表示当前这一列使用的模板名称
          template: "opt",
        },
      ],
      addDialogVisible: false,
      editDialogVisible: false,
      removeDialogVisible: false,
      editForm: {
        cat_name: "",
      },
      editFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          {
            pattern: /[\u4e00-\u9fa5_a-zA-Z]{2,6}/,
            message: "分类名称的长度在 2 到 6 个字符",
            trigger: "blur",
          },
        ],
      },
      addForm: {
        //分类名称
        cat_name: "",
        //父级分类id
        cat_pid: 0,
        //分类层级
        cat_level: 0,
      },
      addFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          {
            pattern: /[\u4e00-\u9fa5_a-zA-Z]{2,6}/,
            message: "分类名称的长度在 2 到 6 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {},
  watch: {},
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      //console.log(res);
      //把数据列表赋值给catelist
      this.catelist = res.data.result;
      //把总条数赋值给total
      this.total = res.data.total;
    },
    // 关闭修改对话框回显到初始值
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //获取点击的商品分类修改弹框里面的回显值
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`categories/${id}`);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    //提交修改后的分类
    editCate() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.editForm.cat_id}`,
          this.editForm
        );
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.editDialogVisible = false;
        this.getCateList();
      });
    },
    //删除按钮弹框
    async removeCateById(cat_id, cat_name) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除" + cat_name + "类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm")
        return this.$message.info("已经取消删除！");
      const { data: res } = await this.$http.delete(`categories/${cat_id}`);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.$message.success("删除成功！");
      this.getCateList();
    },
    //添加分类对话框
    showAddCateDialog() {
      this.getParentCateList();
      this.addDialogVisible = true;
    },
    //监听当前页码改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    //获取父级分类数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      console.log(res.data);
      this.parentCateList = res.data;
    },
    //选择项发生变化触发这个函数
    parentCateChange() {
      //console.log(this.selectedKeys);
      // 如果传入的selectedKeys值数组长度大于0，则选中了父级分类
      //反之则没有
      if (this.selectedKeys.length > 0) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        //给当前分类的等级赋值
        this.addForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        //父级分类id
        this.addForm.cat_pid = 0;
        //为当前分类的等级赋值
        this.addForm.cat_level = 0;
      }
    },
    addCate() {
      //console.log(this.addForm);
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("categories", this.addForm);
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
        this.$message.success("添加分类成功！");
        this.getCateList();
        this.addDialogVisible = false;
      });
    },
    // 关闭添加对话框回显到初始值
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
      this.selectedKeys = [];
      this.addForm.cat_pid = 0;
      this.addForm.cat_level = 0;
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
.el-cascader {
  width: 100%;
}
</style>
