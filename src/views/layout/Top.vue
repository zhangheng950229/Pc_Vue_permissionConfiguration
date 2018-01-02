<template>
  <div class="navbar" style="position:relative;">
    <div class="mid_navbar" style="width:100%;">
      <h1 class="navbar_logo2"></h1>
      <div class="pls_login">
        <span class="user_info">{{loginUser.userCname}}</span>
        <div class="user_hd_box" style="display: block">
          <div class="dotdotdot" @click="isShowLoginout = !isShowLoginout"><a>...</a></div>
          <ul v-show="isShowLoginout">
            <li @click="loginout"><span class="logout">退出</span></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    on,
    off
  } from 'element-ui/src/utils/dom';
  import Api from '@/services/BusiArchCfg';
  export default {
    data() {
      return {
        isShowLoginout: false,
        loginUser: {}
      }
    },
    methods: {
      loginout() {
        document.cookie = '';
        window.location.href = 'http://bigdata.58.com/login?url=http://pzzx.58.com'
      },
      handleDocumentClick(e) {
        if (!this.$el ||
          this.$el.contains(e.target)) return
        this.isShowLoginout = false
      }
    },
    async created() {
      const loginUser = await Api.loginUser()
      if (this.isArray(loginUser)) {
        this.loginUser = loginUser[0]
      }
      on(document, 'click', this.handleDocumentClick);
    },
    destroyed() {
      off(document, 'click', this.handleDocumentClick);
    }
  };
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .navbar_logo2 {
    float: left;
    width: 240px;
    height: 71px;
    background: url(../../assets/logo.jpg) center no-repeat;
    margin: 0;
    color: #3398DB;
    font-size: 24px;
    line-height: 71px;
    text-align: center;
  }
  .navbar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 10;
    width: 100%;
    height: 70px;
    border-bottom: 1px solid #2A2A2A;
    background-color: #343434;
    color: #fff;
    text-align: center;
    .title {
      margin-top: 24px;
      margin-left: 22px;
    }
    .mid_navbar {
      width: 1298px;
      display: inline-block;
      text-align: left;
    }
    .navbar_logo2 {
      float: left;
      width: 240px;
      height: 70px; // background: url(img/logo_icon.png) center no-repeat;
      margin: 0;
      color: #3398DB;
      font-size: 24px;
      line-height: 71px;
      text-align: center
    }
    .pls_login {
      float: right;
      background-color: #1F1F1F;
      width: 255px;
      height: 71px;
      line-height: 71px;
      text-align: center;
      margin-right: 25px;
    }
    .user_hd_box {
      display: inline-block;
      width: 120px;
      float: right;
      &>.dotdotdot {
        font-size: 24px;
        line-height: 58px;
      }
      &>ul {
        background-color: #1F1F1F;
        padding-top: 12px;
        li {
          line-height: 40px;
          cursor: pointer;
        }
      }
      &>.dotdotdot {
        &>a {
          color: #C8C8C8;
        }
      }
    }
    .user_info {
      color: #C8C8C8;
    }
  }
</style>

