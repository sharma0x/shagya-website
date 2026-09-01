import * as migration_20260630_180128_initial from './20260630_180128_initial'
import * as migration_20260701_163431_initial_payload from './20260701_163431_initial_payload'
import * as migration_20260702_120116_add_discount_delivery_time_and_city_of_origin_filters from './20260702_120116_add_discount_delivery_time_and_city_of_origin_filters'
import * as migration_20260702_202856_add_purchaseCount_backInStockRequests_and_trending from './20260702_202856_add_purchaseCount_backInStockRequests_and_trending'
import * as migration_20260703_184203_add_order_notes_and_support_guest_checkout from './20260703_184203_add_order_notes_and_support_guest_checkout'
import * as migration_20260704_064359_add_order_status_timestamps_for_timeline from './20260704_064359_add_order_status_timestamps_for_timeline'
import * as migration_20260705_155739 from './20260705_155739'
import * as migration_20260707_174712_add_instagram_posts_collection from './20260707_174712_add_instagram_posts_collection'
import * as migration_20260714_084351 from './20260714_084351'
import * as migration_20260719_123300_add_coupons_fields_and_rels from './20260719_123300_add_coupons_fields_and_rels'
import * as migration_20260726_162500_add_hero_images_array from './20260726_162500_add_hero_images_array'
import * as migration_20260726_165100_announcement_bar_array from './20260726_165100_announcement_bar_array'
import * as migration_20260807_150206 from './20260807_150206'
import * as migration_20260807_204000_color_variants from './20260807_204000_color_variants'
import * as migration_20260807_204835 from './20260807_204835'
import * as migration_20260807_221534_trust_signals from './20260807_221534_trust_signals'
import * as migration_20260808_000000_coupon_enhancements from './20260808_000000_coupon_enhancements'
import * as migration_20260808_104707 from './20260808_104707'
import * as migration_20260808_164034_add_testimonial_rating from './20260808_164034_add_testimonial_rating'
import * as migration_20260819_174456_add_order_item_color_fields from './20260819_174456_add_order_item_color_fields'
import * as migration_20260820_001000_update_coupons_collections from './20260820_001000_update_coupons_collections'
import * as migration_20260901_222400_convert_product_occasion_to_occasions_relationship from './20260901_222400_convert_product_occasion_to_occasions_relationship'

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
    name: '20260714_084351',
  },
  {
    up: migration_20260719_123300_add_coupons_fields_and_rels.up,
    down: migration_20260719_123300_add_coupons_fields_and_rels.down,
    name: '20260719_123300_add_coupons_fields_and_rels',
  },
  {
    up: migration_20260726_162500_add_hero_images_array.up,
    down: migration_20260726_162500_add_hero_images_array.down,
    name: '20260726_162500_add_hero_images_array',
  },
  {
    up: migration_20260726_165100_announcement_bar_array.up,
    down: migration_20260726_165100_announcement_bar_array.down,
    name: '20260726_165100_announcement_bar_array',
  },
  {
    up: migration_20260807_150206.up,
    down: migration_20260807_150206.down,
    name: '20260807_150206',
  },
  {
    up: migration_20260807_204000_color_variants.up,
    down: migration_20260807_204000_color_variants.down,
    name: '20260807_204000_color_variants',
  },
  {
    up: migration_20260807_204835.up,
    down: migration_20260807_204835.down,
    name: '20260807_204835',
  },
  {
    up: migration_20260807_221534_trust_signals.up,
    down: migration_20260807_221534_trust_signals.down,
    name: '20260807_221534_trust_signals',
  },
  {
    up: migration_20260808_000000_coupon_enhancements.up,
    down: migration_20260808_000000_coupon_enhancements.down,
    name: '20260808_000000_coupon_enhancements',
  },
  {
    up: migration_20260808_104707.up,
    down: migration_20260808_104707.down,
    name: '20260808_104707',
  },
  {
    up: migration_20260808_164034_add_testimonial_rating.up,
    down: migration_20260808_164034_add_testimonial_rating.down,
    name: '20260808_164034_add_testimonial_rating',
  },
  {
    up: migration_20260819_174456_add_order_item_color_fields.up,
    down: migration_20260819_174456_add_order_item_color_fields.down,
    name: '20260819_174456_add_order_item_color_fields',
  },
  {
    up: migration_20260820_001000_update_coupons_collections.up,
    down: migration_20260820_001000_update_coupons_collections.down,
    name: '20260820_001000_update_coupons_collections',
  },
  {
    up: migration_20260901_222400_convert_product_occasion_to_occasions_relationship.up,
    down: migration_20260901_222400_convert_product_occasion_to_occasions_relationship.down,
    name: '20260901_222400_convert_product_occasion_to_occasions_relationship',
  },
]
