import { Route } from 'vue-router'

// This function will be executed before entering each route. 
// It's important to have 'next()'. It enables navigation to new route.
// See https://router.vuejs.org/guide/advanced/navigation-guards.html#global-guards
export function beforeEach(to: Route, from: Route, next) {
  console.log('We are going to visit', to.name)
  next()
}