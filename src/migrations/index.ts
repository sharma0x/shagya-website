<<<<<<< HEAD
<<<<<<< HEAD
import * as migration_20260628_091813_totp_secret_for_users from './20260628_091813_totp_secret_for_users';
=======
>>>>>>> feat/clo-40-product-card-actions
=======
>>>>>>> feat/clo-42-order-timeline
import * as migration_20260630_180128_initial from './20260630_180128_initial'
import * as migration_20260701_163431_initial_payload from './20260701_163431_initial_payload'
import * as migration_20260702_120116_add_discount_delivery_time_and_city_of_origin_filters from './20260702_120116_add_discount_delivery_time_and_city_of_origin_filters';
import * as migration_20260705_155739 from './20260705_155739'
<<<<<<< HEAD
import * as migration_20260707_174712_add_instagram_posts_collection from './20260707_174712_add_instagram_posts_collection'
=======
>>>>>>> feat/clo-42-order-timeline

export const migrations = [
  {
    up: migration_20260630_180128_initial.up,
    down: migration_20260630_180128_initial.down,
    name: '20260630_180128_initial',
  },
  {
    up: migration_20260701_163431_initial_payload.up,
    down: migration_20260701_163431_initial_payload.down,
    name: '20260701_163431_initial_payload',
  },
  {
    up: migration_20260705_155739.up,
    down: migration_20260705_155739.down,
    name: '20260705_155739',
  },
<<<<<<< HEAD
  {
<<<<<<< HEAD
    up: migration_20260628_091813_totp_secret_for_users.up,
    down: migration_20260628_091813_totp_secret_for_users.down,
    name: '20260628_091813_totp_secret_for_users',
  },
  {
    up: migration_20260702_120116_add_discount_delivery_time_and_city_of_origin_filters.up,
    down: migration_20260702_120116_add_discount_delivery_time_and_city_of_origin_filters.down,
    name: '20260702_120116_add_discount_delivery_time_and_city_of_origin_filters',
  },
  {
=======
>>>>>>> feat/clo-40-product-card-actions
    up: migration_20260707_174712_add_instagram_posts_collection.up,
    down: migration_20260707_174712_add_instagram_posts_collection.down,
    name: '20260707_174712_add_instagram_posts_collection',
  },
=======
>>>>>>> feat/clo-42-order-timeline
]
