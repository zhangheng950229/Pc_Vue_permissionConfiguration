<template>
  <div class="r_content">
    <div class="forbid_box">
      <div class="forbid_txt_box">
        <h1>权限问题！</h1>
        <span>抱歉，您没有权限访问。<br />申请权限请发送邮件到bdSupport@58ganji.com</span>
        <div style="text-align:left;margin-top:15px;">
          <button class="fm_btns fm_btn_return" @click="back">返回</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    methods: {
      back() {
        window.history.back();
      }
    }
  }
</script>

<style scoped>
  .r_content {
    margin: 10px 30px;
    min-width: 1059px;
    min-height: 100%;
  }
  .forbid_box {
    width: 600px;
    height: 280px;
    background: url(http://bigdata.58.com/images/forbid.png) no-repeat;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .forbid_txt_box {
    margin: 80px 0 20px 280px;
  }
  .forbid_txt_box>h1 {
    font-size: 29px;
  }
  .forbid_txt_box>span {
    line-height: 25px;
    font-size: 14px;
    font-weight: bold;
    word-break: break-all;
  }
  .forbid_txt_box>span>span.color_txt {
    color: #3284A7;
  }
  .fm_btns {
    width: 124px;
    height: 28px;
    border: 1px solid #EBEBEB;
    background-color: #3284A7;
    text-align: center;
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    border-radius: 5px;
    cursor: pointer;
  }
</style>
