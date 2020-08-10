import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../components/Login.vue";
import Home from "../components/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/home",
    component: Home,
  },
];

const router = new VueRouter({
  routes,
  mode: "history",
});

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //1.to:将要访问的路径
  //2.from:代表从哪个路径跳转过来
  //3.next:是一个函数，表示放行执行下一个路由组件
  // 3.1:next()表示按照顺序执行下一个路由组件，next('/login')表示强制执行括号中的路由组件

  //判断访问的路径是否为login,是就直接下一步
  if (to.path === "/login") return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem("token");
  //判断token值是否正确，不正确跳转login界面，正确则执行下一步
  if (!tokenStr) return next("/login");
  next();
});

export default router;
