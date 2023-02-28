import { createStore } from 'vuex'
import md5 from 'md5'
import { login, getinfo } from '~/api/manager'
import { setToken, removeToken, getToken } from '~/composables/auth'

import { getItem, setItem } from '~/composables/storage'
// 导入 element 对应消息模块
import { ElMessage } from 'element-plus'

const store = createStore({
  state() {
    return {
      // 用户信息
      user: {},

      // 侧边宽度
      asideWidth: '250px',

      menus: [],
      ruleNames: [],
      chartsToken: getItem('charts-token') || '',
    }
  },
  mutations: {
    // 记录用户信息
    SET_USERINFO(state, user) {
      state.user = user
    },
    // 展开/缩起侧边
    handleAsideWidth(state) {
      state.asideWidth = state.asideWidth == '150px' ? '64px' : '150px'
    },
    SET_MENUS(state, menus) {
      state.menus = menus
    },
    SET_RULENAMES(state, ruleNames) {
      state.ruleNames = ruleNames
    },
    SET_CHARTS_TOKEN(state, chartsToken) {
      state.chartsToken = chartsToken
      setItem('charts-token', chartsToken)
    },
  },
  actions: {
    // 登录
    login({ commit }, { username, password }) {
      return new Promise((resolve, reject) => {
        login(username, password)
          .then((res) => {
            setToken(res.token)

            resolve(res)
          })
          .catch((err) => reject(err))
      })
    },
    // 获取当前登录用户信息
    getinfo({ commit }) {
      return new Promise((resolve, reject) => {
        getinfo()
          .then((res) => {
            commit('SET_USERINFO', res)
            commit('SET_MENUS', res.menus)
            commit('SET_RULENAMES', res.ruleNames)
            resolve(res)
          })
          .catch((err) => reject(err))
      })
    },
    // 退出登录
    logout({ commit }) {
      // 移除cookie里的token
      removeToken()
      // 清除当前用户状态 vuex
      commit('SET_USERINFO', {})
    },

    // 登录
    loginCharts({ commit }) {
      return new Promise((resolve, reject) => {
        loginCarts({
          username: 'super-admin',
          password: md5('123456'),
        })
          .then((res) => {
            console.log('🚀 ~ file: index.js:86 ~ .then ~ res:', res)
            commit('SET_CHARTS_TOKEN', res.token)

            resolve(res)
          })
          .catch((err) => reject(err))
      })
    },
  },
})

export default store
