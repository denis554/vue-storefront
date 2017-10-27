import Vue from 'vue'
import Vuex from 'vuex'
import * as types from './mutation-types'

// import * as types from './mutation-types'
import * as localForage from 'localforage'
import UniversalStorage from '../lib/storage'

Vue.prototype.$db = {
  ordersCollection: localForage.createInstance({
    name: 'shop',
    storeName: 'orders'
  }),

  categoriesCollection: new UniversalStorage(localForage.createInstance({
    name: 'shop',
    storeName: 'categories'
  })),

  attributesCollection: new UniversalStorage(localForage.createInstance({
    name: 'shop',
    storeName: 'attributes'
  })),

  cartsCollection: localForage.createInstance({
    name: 'shop',
    storeName: 'carts'
  }),

  elasticCacheCollection: new UniversalStorage(localForage.createInstance({
    name: 'shop',
    storeName: 'elasticCache'
  })),

  productsCollection: new UniversalStorage(localForage.createInstance({
    name: 'shop',
    storeName: 'products'
  }))
}

global.db = Vue.prototype.$db // localForage instance

import order from './modules/order'
import product from './modules/product'
import category from './modules/category'
import attribute from './modules/attribute'
import cart from './modules/cart'
import user from './modules/user'
import payment from './modules/payment'
import shipping from './modules/shipping'
import ui from './modules/ui-store'
import checkout from './modules/checkout'
import homepage from './modules/homepage'
import social from './modules/social-tiles'

Vue.use(Vuex)

const state = {
}

const mutations = {
  TOPICS_LIST: (state, topics) => {
    state.topics = topics
  },

  INCREMENT: (state) => {
    state.count++
  },

  DECREMENT: (state) => {
    state.count--
  }
}

const plugins = [
  store => {
    store.subscribe((mutation, store) => {
      if (mutation.type.indexOf(types.SN_CART) === 0) { // check if this mutation is cart related
        global.db.cartsCollection.setItem('current-cart', store.cart.cartItems).catch((reason) => {
          console.debug(reason) // it doesn't work on SSR
        }) // populate cache
      }
    })
  }
]

export default new Vuex.Store({
  modules: {
    order,
    product,
    category,
    attribute,
    cart,
    user,
    payment,
    shipping,
    ui,
    homepage,
    social,
    checkout
  },
  state,
  mutations,
  plugins
})
