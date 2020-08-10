<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  name: "home",
  data() {
    return {};
  },
  computed: {},
  watch: {},
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
  },
  created() {},
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

<style lang="less" scoped></style>
