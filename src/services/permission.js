import axios from '@/utils/fetch.base';
import { Message } from 'element-ui';
const _ = require('ramda');

const ALLLINE = '/product/allLine';
const USERINFO = '/userManagement/userInfo';
const DELETEUSER = '/userManagement/deleteUser';
const ORGROOT = '/userRight/orgRoot';
const SUNORGLIST = '/userRight/sunOrgList';
const EDITROOTLIST = '/userRight/editRootList';
const EDITSUNLIST = '/userRight/editSunList';
const EDITCOPYRIGHT = '/userManagement/editCopyRight';
const USEROALIST = '/userManagement/userOaList';
const OASEARCH = '/userManagement/oaSearch';
const CREATEUSERRIGHT = '/userManagement/createUserRight';
const ISEXIST = '/userManagement/isExist';
const COPYUSERLIST = '/userManagement/copyUserList';
const COPYUSERRIGHT = '/userManagement/copyUserRight';
const EDITUSERRIGHT = '/userManagement/editUserRight';
const EXPORT = '/userManagement/download';
const _EXPORT = '/userManagement/download'

const isSuccess = _.compose(_.equals(1), _.prop('code'))
const basicSuccess = (resp) => {
  if (isSuccess(resp)) {
    return resp.datas
  } else {
    Message(resp.message)
    return resp.code
  }
}
const basic = (url, method) => {
  return (params) => {
    return axios[method](url, { params }).then(basicSuccess)
  }
}

// TODO 优化
const compareList = (originList, editList) => {
  const result = [];

  // OPTION ---- 1 
  originList.forEach(origin => {
    let isExist = false;
    editList.forEach(edit => {
      if (origin === edit) {
        isExist = true
      }
    })
    if (!isExist) {
      result.push({
        type: 'delete',
        id: origin
      })
    }
  })

  editList.forEach(edit => {
    let isExist = false;
    originList.forEach(origin => {
      if (edit === origin) {
        isExist = true
      }
    })
    if (!isExist) {
      result.push({
        type: 'add',
        id: edit
      })
    }
  })

  // OPTION ---- 2
  /**
   * 去重 - originList 为删除 ／ editList 为新增
   */
  
  return result
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

export default {
  allLine() {
    return axios
      .get(ALLLINE)
      .then(basicSuccess)
  },
  userInfo(params) {
    return axios
      .get(USERINFO, { params })
      .then(resp => {
        if (isSuccess(resp)) {
          return _.pipe(
            _.prop('datas'),
            _.head,
            _.pick(['total', 'list'])
          )(resp)
        } else {
          Message(resp.message)
          return resp.code
        }
      })
  },
  orgRoot(params) {
    return axios
      .get(ORGROOT, {
        params
      })
      .then(resp => {
        if (isSuccess(resp)) {
          return _.pipe(
            _.prop('datas'),
            _.head,
            _.head
          )(resp)
        } else {
          Message(resp.message)
          return resp.code
        }
      })
  },
  editRootList(params) {
    return axios
      .get(EDITROOTLIST, {
        params
      })
      .then(resp => {
        if (isSuccess(resp)) {
          return _.pipe(
            _.prop('datas'),
            _.head,
            _.head
          )(resp)
        } else {
          Message(resp.message)
          return resp.code
        }
      })
  },
  sunOrgList(params) {
    return axios
      .get(SUNORGLIST, {
        params
      })
      .then(resp => {
        if (isSuccess(resp)) {
          return _.pipe(
            _.prop('datas'),
            _.head
          )(resp)
        } else {
          Message(resp.message)
          return resp.code
        }
      })
  },
  editSunList(params) {
    return axios
      .get(EDITSUNLIST, {
        params
      })
      .then(resp => {
        if (isSuccess(resp)) {
          return _.pipe(
            _.prop('datas'),
            _.head
          )(resp)
        } else {
          Message(resp.Message)
          return resp.code
        }
      })
  },
  userOaList(params) {
    return axios
      .get(USEROALIST, {
        params
      })
      .then(resp => {
        if (isSuccess(resp)) {
          return _.pipe(
            _.prop('datas'),
            _.head
          )(resp)
        } else {
          Message(resp.Message)
          return resp.code
        }
      })
  },
  export(params) {
    let url = [_EXPORT, '?'];
    let keys = Object.keys(params);
    keys.forEach(item => {
      url.push([item, '=', params[item], '&'].join(''))
    })
    let iframe = document.createElement('iframe');
    iframe.style.display = 'none'
    iframe.src = url.join('')
    document.body.appendChild(iframe)
    // TODO REMOVE THE TAG
    iframe.onload = function () {}
  },
  editUserRight(params, originList, editedList) {
    params.orgStatusList = JSON.stringify(compareList(originList, editedList))
    return axios
      .get(EDITUSERRIGHT, {
        params
      })
      .then(basicSuccess)
  },
  oaSearch: basic(OASEARCH, 'get'),
  createUserRight: basic(CREATEUSERRIGHT, 'get'),
  deleteUser: basic(DELETEUSER, 'get'),
  isExist: basic(ISEXIST, 'get'),
  copyUserList: basic(COPYUSERLIST, 'get'),
  copyUserRight: basic(COPYUSERRIGHT, 'get'),
  editCopyRight: basic(EDITCOPYRIGHT, 'get')
}