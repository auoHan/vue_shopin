<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="~assets/img/heima.png" alt="黑马电商" title="黑马电商" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">| | |</div>
        <!-- 侧边栏导航 -->
        <!-- 绑定ele组件中的unique-opened不进行动态赋值就是true -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened
          :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 一级菜单图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 一级菜单标题 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <!-- :index为跳转路径 -->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id"
              @click="saveNavState('/'+subItem.path)">
              <!-- 二级菜单模板区域 -->
              <template slot="title">
                <!-- 二级菜单图标 -->
                <i class="el-icon-menu"></i>
                <!-- 二级菜单标题 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: "home",
    data() {
      return {
        //左侧菜单数据
        menulist: [],
        //给每一个一级菜单加一个不一样的图标,通过id来添加
        iconsObj: {
          "125": "iconfont icon-yonghuguanli",
          "103": "iconfont icon-quanxianguanli",
          "101": "iconfont icon-shangpinguanli",
          "102": "iconfont icon-dingdan-copy",
          "145": "iconfont icon-shujutongji",
        },
        //设置是否隐藏的初始值
        isCollapse: false,
        //被激活的连接初始值
        activePath: "",
      };
    },
    computed: {},
    watch: {},
    methods: {
      //退出按钮
      logout() {
        window.sessionStorage.clear();
        this.$router.push("/login");
      },
      //获取所有的菜单
      async getMenuList() {
        const { data: res } = await this.$http.get("menus");
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.menulist = res.data;
        //console.log(res);
      },
      //设置侧边栏菜单隐藏和显示按钮
      toggleCollapse() {
        this.isCollapse = !this.isCollapse;
      },
      //保存连接的激活状态
      saveNavState(activePath) {
        //在sessionStorage保存一个路径值
        window.sessionStorage.setItem("activePath", activePath);
        //当重新点击的时候再次赋值
        this.activePath = activePath;
      },
    },
    //在页面加载完成之前拿到对应的值
    created() {
      this.getMenuList();
      this.activePath = window.sessionStorage.getItem("activePath");
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

<style lang="less" scoped>
  .home_container {
    width: 100%;
    height: 100%;
  }

  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;

    >div {
      display: flex;
      align-items: center;

      >span {
        margin-left: 15px;
        color: #fff;
        font-size: 20px;
      }
    }
  }

  .el-aside {
    background-color: #333744;

    .toggle-button {
      background-color: #4a5064;
      line-height: 24px;
      color: #fff;
      font-size: 12px;
      text-align: center;
      cursor: pointer;
    }

    .el-menu {
      border: none;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }

  .iconfont {
    margin-right: 10px;
  }
</style>