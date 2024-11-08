// store/index.js
import { createStore } from 'vuex'

export default createStore({
  state: {
    currentStatementId: null,
  },
  mutations: {
    setCurrentStatementId(state, statementId) {
      state.currentStatementId = statementId
    },
  },
  // ...
})

