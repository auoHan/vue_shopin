<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleslist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 行 -->
            <el-row
              :class="['bdbottom',i1===0 ? 'bdtop':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 第一列渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightsById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 第二列渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2===0 ? '':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightsById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightsById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scope.row}}
            </pre>-->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              size="small"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              size="small"
              type="danger"
              icon="el-icon-delete"
              @click="removeRolesById(scope.row.id,scope.row.roleDesc)"
            >删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button
              size="small"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
        @submit.native.prevent
        @keyup.enter.native="addRoles"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addRoles" native-type="submit">确 定</el-button>
        <el-button @click="addDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 修改编辑的对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="80px"
        @submit.native.prevent
        @keyup.enter.native="editRoles"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editRoles" native-type="submit">确 定</el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="allotRights">确 定</el-button>
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "roles",
  data() {
    return {
      //获取所有角色列表数据
      roleslist: [],
      //所有权限的数据
      rightslist: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children",
      },
      // 添加角色对话框显示与隐藏
      addDialogVisible: false,
      //分配权限对话框是否显示与隐藏
      setRightDialogVisible: false,
      // 修改角色对话框显示与隐藏
      editDialogVisible: false,
      //默认选中的节点id值数组
      defKeys: [],
      //定义roleId的初始值
      roleId: "",
      //定义要添加的属性
      addForm: {
        roleName: "",
        roleDesc: "",
      },
      //定义要添加的属性规则
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          {
            pattern: /[\u4e00-\u9fa5_a-zA-Z0-9_]{2,10}/,
            message: "角色名的长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            pattern: /[\u4e00-\u9fa5_a-zA-Z0-9_]{2,10}/,
            message: "角色描述的长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
      },

      editForm: {
        roleName: "",
        roleDesc: "",
      },
      editFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          {
            pattern: /[\u4e00-\u9fa5_a-zA-Z0-9_]{2,10}/,
            message: "角色名的长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            pattern: /[\u4e00-\u9fa5_a-zA-Z0-9_]{2,10}/,
            message: "角色描述的长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {},
  watch: {},
  methods: {
    //获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败！");
      //console.log(res);
      this.roleslist = res.data;
    },
    // 对话框消失重置对话框信息
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //提交添加角色按钮
    addRoles() {
      //发起表单提交之前的预校验
      this.$refs.addFormRef.validate(async (valid) => {
        //判断是否通过，再进行下一步操作
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status !== 201)
          return this.$message.error("添加角色失败！");
        this.$message.success("添加角色成功！");
        this.addDialogVisible = false;
        this.getRolesList();
      });
    },
    // 根据id获取数据
    async showEditDialog(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get(`roles/${id}`);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.editForm = res.data;
    },
    //提交修改后的表单
    editRoles() {
      //发起表单提交之前的预校验
      this.$refs.editFormRef.validate(async (valid) => {
        //判断是否通过，再进行下一步操作
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `roles/${this.editForm.roleId}`,
          this.editForm
        );
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.$message.success("修改角色成功！");
        this.editDialogVisible = false;
        this.getRolesList();
      });
    },
    //删除角色按钮
    async removeRolesById(id, roleDesc) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除" + roleDesc + "角色, 是否继续?",
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
      const { data: res } = await this.$http.delete(`roles/${id}`);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.$message.success("删除成功！");
      this.getRolesList();
    },
    //分配角色权限按钮
    async showSetRightDialog(role) {
      this.setRightDialogVisible = true;
      //为每一次打开权限分配管理进行初始化默认值
      this.defKeys = [];
      //定义roleId,保存到data数据中
      this.roleId = role.id;
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      //把获取到的权限数据保存到rightslist中
      this.rightslist = res.data;
      this.getLeafKeys(role, this.defKeys);
    },
    // 点击删除时根据id弹出提示框，确认是否删除权限
    async removeRightsById(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm")
        return this.$message.info("已经取消删除！");
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.$message.success("删除成功！");
      //不建议直接调用getRolesList方法，因为会重新加载刷新页面
      //this.getRolesList();
      //删除完成后重新给scope.row.children赋值
      role.children = res.data;
    },
    //通国递归的形式，
    //获取角色下所有的三级权限id，
    //并保存到defKeys数组中
    getLeafKeys(node, arr) {
      /* 
      如果当前节点不包含children，
      那么此节点就是三级节点，
      如果包含则继续执行下一步的循环
       */
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => this.getLeafKeys(item, arr));
    },
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      console.log(keys);
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

      this.$message.success("分配权限成功！");
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
  },

  created() {
    this.getRolesList();
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

<style lang='less' scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
//定义一个居中对齐的类
.vcenter {
  display: flex;
  align-items: center;
}
</style>