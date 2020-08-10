import Vue from "vue";
import App from "./App.vue";
import router from "./router";
// 引入样式组件css
import "./plugins/element.js";
// 引入字体图标css
import "./assets/fonts/iconfont.css";
// 引入基本样式css
import "./assets/css/global.css";
//引入axios
import axios from "axios";
//为axios设置请求的根路径
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
//挂载到vue的原型对象上，至此每一个组件都可以用this直接调用$http去发起axios请求
Vue.prototype.$http = axios;

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
