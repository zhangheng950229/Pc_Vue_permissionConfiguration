import axios from '@/utils/fetch.base';
import { Message } from 'element-ui';
const _ = require('ramda');

const LOGINUSER = '/businessInfo/loginUser';
const ALLSTRUCTURE = '/business/allStructure';
const ALLLINE = '/product/allLine';
const CREATEARCH = '/business/createStructure';
const GETROOTBUS = '/businessInfo/getRootBus';
const GETSUBBUS = '/businessInfo/getSubBus';
const GETSUBORG = '/org/getSubOrg';
const ADDBUS = '/businessInfo/addBus';
const DELBUS = '/businessInfo/delBus';
const PAGESTRUCTURE = 'business/pageStructure';
const DELSTRUCTURE = '/business/delStructure';
const ADDBIND = '/relation/addBind';
const BINDRELATION = '/relation/bindRelation';
const TABLEOFRELATION = '/relation/tableOfRelation';
const DELBIND = '/relation/delBind';
const UPDATEBUSORDER = '/businessInfo/updateBusOrder';
const UPDATEBUSNAME = '/businessInfo/updateBusName';
const UPDATESTATUS = '/businessInfo/updateStatus';
const EXPORT = '/relationTable/download';
const _EXPORT = '/relationTable/download'


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
export default {
  loginUser: basic(LOGINUSER, 'get'),
  allLine: basic(ALLLINE, 'get'),
  updateBusOrder: basic(UPDATEBUSORDER, 'get'),
  updateStatus: basic(UPDATESTATUS, 'get'),
  delBus: basic(DELBUS, 'get'),
  delBind: basic(DELBIND, 'get'),
  getRootBus: basic(GETROOTBUS, 'get'),
  getSubBus: basic(GETSUBBUS, 'get'),
  addBus: basic(ADDBUS, 'get'),
  getSubOrg: basic(GETSUBORG, 'get'),
  addBind: basic(ADDBIND, 'get'),
  bindRelation: basic(BINDRELATION, 'get'),
  updateBusName: basic(UPDATEBUSNAME, 'get'),
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
  createArch: function (params) {
    return axios
      .get(CREATEARCH, {
        params: params
      })
      .then((data) => {
        if (isSuccess(data)) {
          return _.pipe(
            _.prop('datas'),
            _.head
          )(data)
        } else {
          return _.prop('message')(data)
        }
      })
  },
  pageStructure: function (params) {
    return axios
      .get(PAGESTRUCTURE, {
        params
      })
      .then(resp => {
        if (isSuccess(resp)) {
          return _.pipe(
            _.prop('datas'),
            _.head,
            _.pick(['total', 'list'])
          )(resp)
        } else {
          return _.prop('message')(resp)
        }
      })
  },
  delStructure: function (params) {
    return axios
      .get(DELSTRUCTURE, {
        params
      })
      .then(resp => _.prop('datas')(resp))
  },
  tableOfRelation: function (params) {
    return axios
      .get(TABLEOFRELATION, {
        params
      })
      .then(resp => {
        if (isSuccess(resp)) {
          return _.pipe(
            _.prop('datas'),
            _.head,
            _.pick(['total', 'list'])
          )(resp)
        } else {
          return _.prop('message')(resp)
        }
      })
  }
}
