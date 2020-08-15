<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索添加区域 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <!-- 搜索框 -->
          <!-- 
            v-model：双向绑定搜索关键字
            clearable：获得可清空按钮
            @clear="getUserList"：清空后重新获取数据
            @keyup.enter.native="getUserList"：按下回车键进行搜索
          -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList"
            @keyup.backspace.native="getUserList" @keyup.enter.native="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 表格视图区 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽的使用，通过定义template模板中的slot-scope="scope"属性，可以用scope.row拿到当前列的所有信息 -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" active-text="在线" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" slot="reference"
              @click="removeUserById(scope.row.id,scope.row.username)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" @submit.native.prevent
        @keyup.enter.native="addUser">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addUser" native-type="submit">确 定</el-button>
        <el-button @click="addDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体区 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px" @submit.native.prevent
        @keyup.enter.native="editUser">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editUser" native-type="submit">确 定</el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>
          分配新的角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "users",
    data() {
      return {
        //获取列表的参数对象
        queryInfo: {
          //搜索关键字
          query: "",
          //显示的页码
          pagenum: 1,
          //每页显示的条数
          pagesize: 2,
        },
        userlist: [],
        total: 0,
        // 添加用户对话框的显示与隐藏
        addDialogVisible: false,
        //分配角色对话框的显示与隐藏
        setRoleDialogVisible: false,
        //添加用户的表单数据
        addForm: {
          username: "",
          password: "",
          email: "",
          mobile: "",
        },
        //添加表单的验证规则
        addFormRules: {
          username: [
            { required: true, message: "请输入用户名", trigger: "blur" },
            {
              min: 3,
              max: 8,
              message: "用户名的长度在 3 到 8 个字符",
              trigger: "blur",
            },
          ],
          password: [
            { required: true, message: "请输入密码", trigger: "blur" },
            {
              min: 6,
              max: 16,
              message: "密码的长度在 6 到 16 个字符",
              trigger: "blur",
            },
          ],
          email: [
            { required: true, message: "请输入邮箱", trigger: "blur" },
            {
              type: "email",
              message: "请输入正确的邮箱",
              trigger: "blur",
            },
          ],
          mobile: [
            { required: true, message: "请输入手机号码", trigger: "blur" },
            {
              pattern: /^0{0,1}(13[0-9]|15[7-9]|153|156|18[7-9])[0-9]{8}$/,
              message: "请输入正确的手机号",
              trigger: "blur",
            },
          ],
        },
        //修改用户对话框的显示与隐藏
        editDialogVisible: false,
        //修改用户的表单数据
        editForm: {
          username: "",
          email: "",
          mobile: "",
        },
        //修改表单的验证规则
        editFormRules: {
          email: [
            { required: true, message: "请输入邮箱", trigger: "blur" },
            {
              type: "email",
              message: "请输入正确的邮箱",
              trigger: "blur",
            },
          ],
          mobile: [
            { required: true, message: "请输入手机号码", trigger: "blur" },
            {
              pattern: /^0{0,1}(13[0-9]|15[7-9]|153|156|18[7-9])[0-9]{8}$/,
              message: "请输入正确的手机号",
              trigger: "blur",
            },
          ],
        },
        //需要被分配角色的用户信息
        userInfo: {},
        //定义角色列表的初始值
        rolesList: [],
        //选中的id对应的值
        selectedRoleId: "",
      };
    },
    computed: {},
    watch: {},
    methods: {
      //获取用户列表的数据
      async getUserList() {
        const { data: res } = await this.$http.get("users", {
          params: this.queryInfo,
        });
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.userlist = res.data.users;
        this.total = res.data.total;
        // console.log(res);
      },
      //监听pagesize改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize);
        //把新的显示条数拿到再重新赋值给pagesize，再重新获取数据进行页面展示
        this.queryInfo.pagesize = newSize;
        this.getUserList();
      },
      //监听页码值改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage);
        this.queryInfo.pagenum = newPage;
        //把新的显示条数拿到再重新赋值给pagesize，再重新获取数据进行页面展示
        this.getUserList();
      },
      //监听switch开关状态的改变
      async userStateChanged(userinfo) {
        console.log(userinfo);
        const { data: res } = await this.$http.put(
          `/users/${userinfo.id}/state/${userinfo.mg_state}`
        );
        if (res.meta.status !== 200) {
          userinfo.mg_state = !userinfo.mg_state;
          return this.$message.error("设置状态失败！");
        }
        this.$message.success("设置状态成功！");
      },
      //对话框消失重置文本框里面的值
      addDialogClosed() {
        this.$refs.addFormRef.resetFields();
      },
      //添加新增用户
      addUser() {
        //发起表单提交之前的预校验
        this.$refs.addFormRef.validate(async (valid) => {
          //判断是否通过，再进行下一步操作
          if (!valid) return;
          //可以发起添加用户的网络请求
          const { data: res } = await this.$http.post("users", this.addForm);
          if (res.meta.status !== 201)
            return this.$message.error("添加用户失败！");
          this.$message.success("添加用户成功！");
          //完成上述操作后将对话框进行隐藏
          this.addDialogVisible = false;
          //重新获取用户数据进行页面展示
          this.getUserList();
        });
      },
      //展示编辑用户的对话框
      async showEditDialog(id) {
        this.editDialogVisible = true;
        //console.log(id);
        const { data: res } = await this.$http.get(`/users/${id}`);
        if (res.meta.status !== 200) return this.$message.error("请求数据失败！");
        //console.log(res);
        this.editForm = res.data;
      },
      //对话框消失重置文本框里面的值
      editDialogClosed() {
        this.$refs.editFormRef.resetFields();
      },
      //提交修改表单
      editUser() {
        //发起表单提交之前的预校验
        this.$refs.editFormRef.validate(async (valid) => {
          //判断是否通过，再进行下一步操作
          if (!valid) return;
          //可以发起添加用户的网络请求
          const { data: res } = await this.$http.put(
            `users/${this.editForm.id}`,
            this.editForm
          );
          if (res.meta.status !== 200)
            return this.$message.error("修改用户失败！");
          this.$message.success("修改用户成功！");
          //完成上述操作后将对话框进行隐藏
          this.editDialogVisible = false;
          //重新获取用户数据进行页面展示
          this.getUserList();
        });
      },
      //根据id删除对应的用户信息
      async removeUserById(id, username) {
        //弹框询问是否删除
        const confirmResult = await this.$confirm(
          "此操作将永久删除" + username + "用户, 是否继续?",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).catch((err) => err);
        //如果点击确定，那么confirmResult返回的是一个comfirm的字符串
        //如果点击取消，那么confirmResult返回的是一个cancel的字符串
        console.log(confirmResult);
        if (confirmResult !== "confirm")
          return this.$message.info("已经取消删除");
        const { data: res } = await this.$http.delete(`users/${id}`);
        if (res.meta.status !== 200) return this.$message.error("删除失败！");
        this.$message.success("删除成功！");
        // 当删除完成后重新设置页码数为1
        this.handleCurrentChange(1);
        this.getUserList();
      },
      //分配角色的弹框
      async setRole(userInfo) {
        //拿到用户的角色信息，赋值getdata，在页面中进行渲染
        this.userInfo = userInfo;
        //在对话框加载完成之前获取所有角色列表
        const { data: res } = await this.$http.get("roles");
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.rolesList = res.data;
        this.setRoleDialogVisible = true;
      },
      async saveRoleInfo() {
        if (!this.selectedRoleId)
          return this.$message.error("请选择需要分配的角色！");
        const { data: res } = await this.$http.put(
          `users/${this.userInfo.id}/role`,
          {
            rid: this.selectedRoleId,
          }
        );
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.$message.success("更新角色成！");
        this.getUserList();
        this.setRoleDialogVisible = false;
      },
      //关闭对话框使对话框里的值回到初始的默认值
      setRoleDialogClosed() {
        this.selectedRoleId = "";
        this.userInfo = {};
      },
    },
    //当页面加载完成之前调用
    created() {
      this.getUserList();
    },
    mounted() { },
    beforeCreate() { },
    beforeMount() { },
    beforeUpdate() { },
    updated() { },
    beforeDestroy() { },
    destroyed() { },
    activated() { },
    components: {},
  };
</script>

<style lang='less' scoped>
</style>