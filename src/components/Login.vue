<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/img/logo.png" alt="vue" title="vue" />
      </div>
      <!-- 登录表单区域 -->
      <!-- 
        :model表单数据绑定
        :rules表单验证，prop传入要验证的字段名
        给ref赋值可以调用表单属性，见下面methods
      -->
      <el-form
        label-width="0px"
        class="el-form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
      >
        <!-- 账号区域 -->
        <!-- 
          prefix-icon在文本框前面添加图标
          v-model把数据在文本框中进行动态展示
        -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-zhanghao"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!-- 密码区域 -->
        <!-- 增加一个密码可见和不可见功能 -->
        <!-- 不可见密码 -->
        <el-form-item v-if="!isDisplay" prop="password">
          <el-input
            prefix-icon="iconfont icon-suo"
            v-model="loginForm.password"
            type="password"
          ></el-input>
          <i class="iconfont icon-bukejian see" @click="showPass"></i>
        </el-form-item>
        <!-- 可见密码 -->
        <el-form-item v-else prop="password">
          <el-input
            prefix-icon="iconfont icon-suo"
            v-model="loginForm.password"
            type="text"
          ></el-input>
          <i class="iconfont icon-kejian1 see" @click="showPass"></i>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      //表单的数据绑定对象
      loginForm: {
        username: "admin",
        password: "123456",
      },
      //设置密码是否可见的默认值
      isDisplay: false,
      //表单的验证规则对象
      loginFormRules: {
        //验证用户名是否合法
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 8, message: "长度在 3 到 8 个字符", trigger: "blur" },
        ],
        //验证密码是否合法
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 16,
            message: "长度在 6 到 16 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {},
  watch: {},
  methods: {
    // 密码是否可见点击
    showPass() {
      this.isDisplay = !this.isDisplay;
    },
    // 重置表单点击
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    // 登录验证表单点击
    login() {
      //对回调函数的值进行判断，如果为真，则发起请求，反之不发起
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return;
        //因为data是服务器中传过来的真实数据，通过结构赋值拿到data再起别名
        const { data: res } = await this.$http.post("login", this.loginForm);
        if (res.meta.status !== 200) return this.$message.error("登录失败");
        this.$message.success("登录成功");
        //1.将登陆成功之后的token，保存到客户端的sessionStorage中
        //  1.1 项目中除了登陆之外的其他API接口，必须在登陆之后才能进行访问
        //  1.2 token只应在当前网址打开期间生效，所有将token保存在sessionStorage中
        //console.log(res);//res中包含meta和data两个对象，其中data对象中有一个token属性
        window.sessionStorage.setItem("token", res.data.token);
        //2.通过编程式导航跳转到后台主页，路由地址是/home
        this.$router.push("/home");
      });
    },
    keyDown(e) {
      //如果是回车则执行登录方法
      if (e.keyCode == 13) {
        this.login();
      }
    },
  },
  created() {},
  mounted() {
    window.addEventListener("keydown", this.keyDown);
  },
  beforeCreate() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {
    window.removeEventListener("keydown", this.keyDown, false);
  },
  activated() {},
  components: {},
};
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    width: 130px;
    height: 130px;
    position: relative;
    left: 50%;
    top: -65px;
    margin-left: -65px;
    padding: 5px;
    border: 1px solid #eee;
    border-radius: 50%;
    box-shadow: 0 0 10px #ddd;
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.el-form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  .see {
    position: absolute;
    right: 10px;
    top: 2px;
  }
  /deep/ .el-input__inner {
    //修改ele自带样式
    padding: 0 30px;
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
