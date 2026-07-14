import * as migration_20260630_180128_initial from './20260630_180128_initial';
import * as migration_20260701_163431_initial_payload from './20260701_163431_initial_payload';
import * as migration_20260702_120116_add_discount_delivery_time_and_city_of_origin_filters from './20260702_120116_add_discount_delivery_time_and_city_of_origin_filters';
import * as migration_20260702_202856_add_purchaseCount_backInStockRequests_and_trending from './20260702_202856_add_purchaseCount_backInStockRequests_and_trending';
import * as migration_20260703_184203_add_order_notes_and_support_guest_checkout from './20260703_184203_add_order_notes_and_support_guest_checkout';
import * as migration_20260704_064359_add_order_status_timestamps_for_timeline from './20260704_064359_add_order_status_timestamps_for_timeline';
import * as migration_20260705_155739 from './20260705_155739';
import * as migration_20260707_174712_add_instagram_posts_collection from './20260707_174712_add_instagram_posts_collection';
import * as migration_20260714_084351 from './20260714_084351';

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
    up: migration_20260702_120116_add_discount_delivery_time_and_city_of_origin_filters.up,
    down: migration_20260702_120116_add_discount_delivery_time_and_city_of_origin_filters.down,
    name: '20260702_120116_add_discount_delivery_time_and_city_of_origin_filters',
  },
  {
    up: migration_20260702_202856_add_purchaseCount_backInStockRequests_and_trending.up,
    down: migration_20260702_202856_add_purchaseCount_backInStockRequests_and_trending.down,
    name: '20260702_202856_add_purchaseCount_backInStockRequests_and_trending',
  },
  {
    up: migration_20260703_184203_add_order_notes_and_support_guest_checkout.up,
    down: migration_20260703_184203_add_order_notes_and_support_guest_checkout.down,
    name: '20260703_184203_add_order_notes_and_support_guest_checkout',
  },
  {
    up: migration_20260704_064359_add_order_status_timestamps_for_timeline.up,
    down: migration_20260704_064359_add_order_status_timestamps_for_timeline.down,
    name: '20260704_064359_add_order_status_timestamps_for_timeline',
  },
  {
    up: migration_20260705_155739.up,
    down: migration_20260705_155739.down,
    name: '20260705_155739',
  },
  {
    up: migration_20260707_174712_add_instagram_posts_collection.up,
    down: migration_20260707_174712_add_instagram_posts_collection.down,
    name: '20260707_174712_add_instagram_posts_collection',
  },
  {
    up: migration_20260714_084351.up,
    down: migration_20260714_084351.down,
    name: '20260714_084351'
  },
];
