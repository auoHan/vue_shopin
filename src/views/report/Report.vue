<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 2.为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 800px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
//1.导入echarts
import echarts from "echarts";

//导入lodash
import _ from "lodash";
export default {
  name: "report",
  data() {
    return {
      //需要合并的数据
      options: {
        title: {
          text: "用户来源",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3",
            },
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
      },
    };
  },
  computed: {},
  watch: {},
  methods: {},
  //页面渲染前加载
  created() {},
  // 页面渲染完毕后加载
  async mounted() {
    //3. 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById("main"));

    //发起请求，获取数据
    const { data: res } = await this.$http.get("reports/type/1");
    if (res.meta.status !== 200) return this.$message.error("获取数据失败！");

    //4.指定图表的配置项和数据，通过 “_.merge" 将res.data和this.options进行数据合并得到一个新的数据
    const result = _.merge(res.data, this.options);

    //5.使用合并后的数据显示图表。
    myChart.setOption(result);
  },
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

<style lang="less" scoped></style>
