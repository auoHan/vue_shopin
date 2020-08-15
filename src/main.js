import Vue from "vue";
import App from "@/App.vue";
import router from "@/router";
// 引入样式组件js
import "plugins/element.js";
// 引入字体图标css
import "assets/fonts/iconfont.css";
// 引入基本样式css
import "assets/css/global.css";
//引入axios
import axios from "axios";
//引入树状表格
import TreeTable from 'vue-table-with-tree-grid'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
//为axios设置请求的根路径
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
//设置请求拦截器
axios.interceptors.request.use(config => {
  //console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
})
//挂载到vue的原型对象上，至此每一个组件都可以用this直接调用$http去发起axios请求
Vue.prototype.$http = axios;

Vue.config.productionTip = false;
// 定义树状表格
Vue.component('tree-table', TreeTable)
// 定义时间过滤器，将毫秒值转换成日期
//padStart表示两位占位符，不足两位用0来补齐
Vue.filter('dateFormat', originVal => {
  const dt = new Date(originVal);

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDay() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
//将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor, /* { default global options } */ )
new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");