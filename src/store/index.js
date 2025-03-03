import { createStore } from 'vuex'
import menu from './menu'
import createPersistedState from 'vuex-persistedstate'

export default createStore({
  plugins: [new createPersistedState({
    key: 'SMSS_VUE_STORE',
  })],
  modules:{
    menu
  }
})