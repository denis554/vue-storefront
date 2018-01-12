import * as types from '../mutation-types'
import config from 'config'
import EventBus from 'src/event-bus'

// initial state
const state = {
  token: '',
  current: null,
  session_started: new Date()
}

const getters = {
  isLoggedIn (state) {
    return state.current !== null
  }
}

// actions
const actions = {

  startSession (context) {
    context.commit(types.USER_START_SESSION)
  },

  /**
   * Send password reset link for specific e-mail
   */
  resetPassword (context, { email }) {
    console.log({ email: email })
    return fetch(config.users.endpoint + '/resetPassword', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email })
    }).then((response) => {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return response.json()
      } else {
        console.error('Error with response - bad content-type!')
      }

      return response
    })
  },

  /**
   * Login user and return user profile and current token
   */
  login (context, { username, password }) {
    return fetch(config.users.endpoint + '/login', { method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username, password: password })
    }).then(resp => { return resp.json() })
    .then((resp) => {
      if (resp.code === 200) {
        context.commit(types.USER_TOKEN_CHANGED, resp.result)
        context.dispatch('me', { refresh: true, useCache: false }).then(result => {
          context.commit(types.USER_TOKEN_CHANGED, resp.result)
          context.dispatch('cart/serverCreate', {}, { root: true })
          console.log('CU', result)
        })
      }
      return resp
    })
  },

  /**
   * Login user and return user profile and current token
   */
  register (context, { email, firstname, lastname, password }) {
    return fetch(config.users.endpoint + '/create', { method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ customer: { email: email, firstname: firstname, lastname: lastname }, password: password })
    }).then(resp => { return resp.json() })
    .then((resp) => {
      if (resp.code === 200) {
        context.dispatch('login', { username: email, password: password }).then(result => { // login user
        })
      }
      return resp
    })
  },
  /**
   * Load current user profile
   */
  me (context, { refresh = true, useCache = true }) {
    return new Promise((resolve, reject) => {
      const cache = global.db.usersCollection
      let resolvedFromCache = false

      if (useCache === true) { // after login for example we shouldn't use cache to be sure we're loading currently logged in user
        cache.getItem('current-user', (err, res) => {
          if (err) {
            console.error(err)
            return
          }

          if (res) {
            context.commit(types.USER_INFO_LOADED, res)

            resolve(res)
            resolvedFromCache = true
            console.log('Current user served from cache')
          }
        })
      }

      if (refresh) {
        console.log(config.users.endpoint + '/me?token=' + context.state.token)
        return fetch(config.users.endpoint + '/me?token=' + context.state.token, { method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          }
        }).then(resp => { return resp.json() })
        .then((resp) => {
          if (resp.code === 200) {
            context.commit(types.USER_INFO_LOADED, resp.result) // this also stores the current user to localForage

            EventBus.$emit('user-after-loggedin', {
              firstName: resp.result.firstname,
              lastName: resp.result.lastname,
              emailAddress: resp.result.email
            })
          }
          if (!resolvedFromCache) {
            resolve(resp.code === 200 ? resp : null)
          }
          return resp
        })
      } else {
        if (!resolvedFromCache) {
          resolve(null)
        }
      }
    })
  }
}

// mutations
const mutations = {
  [types.USER_TOKEN_CHANGED] (state, newToken) {
    state.token = newToken
  },
  [types.USER_START_SESSION] (state) {
    state.session_started = new Date()
  },
  [types.USER_INFO_LOADED] (state, currentUser) {
    state.current = currentUser
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
