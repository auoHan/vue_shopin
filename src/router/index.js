import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [{
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    component: () => import("components/Login.vue"),
  },
  {
    path: "/home",
    component: () => import("components/Home.vue"),
    redirect: "/welcome",
    children: [{
        path: "/welcome",
        component: () => import("views/welcome/Welcome.vue")
      },
      {
        path: "/users",
        component: () => import("views/user/Users.vue")
      },
      {
        path: "/rights",
        component: () => import("views/power/Rights.vue")
      },
      {
        path: "/roles",
        component: () => import("views/power/Roles.vue")
      },
      {
        path: "/categories",
        component: () => import("views/goods/Cate.vue")
      },
      {
        path: "/params",
        component: () => import("views/goods/Params.vue")
      },
      {
        path: "/goods",
        component: () => import("views/goods/List.vue")
      },
      {
        path: "/goods/add",
        component: () => import("views/goods/Add.vue")
      }
    ]
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