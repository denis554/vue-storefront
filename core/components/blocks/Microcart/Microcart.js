// Core dependecies
import Microcart from '@vue-storefront/core/modules/cart/components/Microcart.ts'

export default {
  name: 'Microcart',
  methods: {
    closeMicrocart () {
      // Method renamed to 'toggleMicrocart'
      this.toggleMicrocart()
    }
  },
  mixins: [
    Microcart
  ]
}
