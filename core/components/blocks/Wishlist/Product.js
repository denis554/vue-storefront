import { removeFromWishlist, closeWishlist } from '@vue-storefront/core/api/wishlist'

export default {
  name: 'Product',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  computed: {
    thumbnail () {
      return this.getThumbnail(this.product.image, 150, 150)
    }
  },
  mixins: [ removeFromWishlist, closeWishlist ]
}
