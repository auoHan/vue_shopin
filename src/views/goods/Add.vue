<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示区 -->
      <el-alert title="添加商品信息" type="info" center show-icon></el-alert>
      <!-- 步骤条区 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 标签页区 -->
      <el-form
        :model="addForm"
        :rules="addFormrules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
        @submit.native.prevent
        @keyup.enter.native="addProduct"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格(元)" prop="goods_price">
              <el-input-number
                :min="0"
                :max="99999999"
                :precision="2"
                v-model="addForm.goods_price"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="商品重量(kg)" prop="goods_weight">
              <el-input-number
                :min="0"
                :max="99999999"
                :precision="2"
                v-model="addForm.goods_weight"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input-number
                :min="0"
                :max="99999999"
                :precision="0"
                v-model="addForm.goods_number"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片要上传到的后台api -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headersObj"
              :on-success="headerSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button
              type="primary"
              class="btnAdd"
              @click="addProduct"
              native-type="submit"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
// 导入深拷贝组件
import _ from "lodash";
export default {
  name: "add",
  data() {
    return {
      activeIndex: "0",
      addForm: {
        goods_name: "",
        goods_price: "",
        goods_weight: "",
        goods_number: "",
        //商品所属的分类数组
        goods_cat: [],
        //商品图片所属的数组
        pics: [],
        //商品的详情描述
        goods_introduce: "",
        //商品的参数（包含 `动态参数` 和 `静态属性`）
        attrs: [],
      },
      addFormrules: {
        goods_name: [
          {
            required: true,
            message: "请输入商品名称",
            trigger: "blur",
          },
        ],
        goods_price: [
          {
            required: true,
            message: "请输入商品价格",
            trigger: "blur",
          },
        ],
        goods_weight: [
          {
            required: true,
            message: "请输入商品重量",
            trigger: "blur",
          },
        ],
        goods_number: [
          {
            required: true,
            message: "请输入商品数量",
            trigger: "blur",
          },
        ],
        goods_cat: [
          {
            required: true,
            message: "请选中商品分类",
            trigger: "blur",
          },
        ],
      },
      catelist: [],
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
        checkStrictly: false,
        expandTrigger: "hover",
      },
      //动态参数列表数据
      manyTableData: [],
      //静态属性列表数据
      onlyTableData: [],
      //上传图片的URL地址，必须是main.js里的路径
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      //图片上传组件的headers请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      //获取展示出来的图片路径
      previewPath: "",
      //是否显示预览图片对话框的默认值
      previewVisible: false,
    };
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
  watch: {},
  methods: {
    //获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类数据失败！");
      this.catelist = res.data;
    },
    //级联选择器选择项变化，会触发这个函数
    handleChange() {
      console.log(this.addForm.goods_cat);
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    //第一个参数代表即将进入的标签页名称，第二个参数代表即将离开的标签页名称
    beforeTabLeave(activeName, oldActiveName) {
      console.log("即将进入的标签页名称" + activeName);
      console.log("即将离开的标签页名称" + oldActiveName);
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类！");
        return false;
      }
    },
    // 被点击选中tab时触发的函数
    async tabClicked() {
      // console.log(this.activeIndex);
      // 判断被点击的索引值是否为1，再发出请求获取参数
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200)
          return this.$message.error("获取动态参数列表失败！");
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length !== 0 ? item.attr_vals.split(" ") : [];
        });
        console.log(res.data);
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200)
          return this.$message.error("获取静态属性列表失败！");
        console.log(res.data);
        this.onlyTableData = res.data;
      }
    },
    //点击图片预览触发此函数
    handlePreview(file) {
      console.log(file);
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    //点击关闭图片触发此函数
    handleRemove(file) {
      console.log(file);
      //1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      //2.从pics数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex((x) => {
        x.pic === filePath;
      });
      //3.调用数组的splice方法，把图片信息对象，从pics数组中移除
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    //点击图片上传成功的事件
    headerSuccess(response) {
      console.log(response);
      //拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      //将图片信息对象，push到pics数组中
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    // 添加商品
    addProduct() {
      // console.log(this.addForm.goods_introduce);
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("请先填写必要的表单项！");
        //执行添加的业务逻辑
        //在进行分割前，进行深拷贝，将addForm拷贝一份新的对象，让addForm在级联里的值不受影响
        // ‘_’ 代表lodash，在上面进行了导入，cloneDeep(Obj)括号里面要传入一个被深拷贝的对象
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(",");
        //处理动态参数
        this.manyTableData.forEach((item) => {
          this.addForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          });
        });
        //处理静态属性
        this.onlyTableData.forEach((item) => {
          this.addForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          });
        });
        form.attrs = this.addForm.attrs;
        console.log(form);

        // 发起添加商品的请求
        // 商品的名称，必须是唯一的
        const { data: res } = await this.$http.post("goods", form);
        if (res.meta.status !== 201)
          return this.$message.error("添加商品失败！");
        this.$message.success("添加商品成功！");

        //通过编程式导航跳转到商品列表页面
        this.$router.push("/goods");
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
.el-steps {
  margin: 15px 0;
}
/deep/ .el-step__title {
  font-size: 12px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
/deep/ .ql-editor {
  min-height: 300px;
}
.btnAdd {
  margin-top: 15px;
}
</style>
