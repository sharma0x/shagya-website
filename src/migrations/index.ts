import * as migration_20260627_104423_initial from './20260627_104423_initial';
import * as migration_20260628_012231_add_email_logs from './20260628_012231_add_email_logs';
import * as migration_20260628_021500_add_newsletter_subscribers from './20260628_021500_add_newsletter_subscribers';
import * as migration_20260628_091813_totp_secret_for_users from './20260628_091813_totp_secret_for_users';
import * as migration_20260702_120116_add_discount_delivery_time_and_city_of_origin_filters from './20260702_120116_add_discount_delivery_time_and_city_of_origin_filters';
import * as migration_20260702_202856_add_purchaseCount_backInStockRequests_and_trending from './20260702_202856_add_purchaseCount_backInStockRequests_and_trending';
import * as migration_20260703_184203_add_order_notes_and_support_guest_checkout from './20260703_184203_add_order_notes_and_support_guest_checkout';
import * as migration_20260704_064359_add_order_status_timestamps_for_timeline from './20260704_064359_add_order_status_timestamps_for_timeline';

export const migrations = [
  {
    up: migration_20260627_104423_initial.up,
    down: migration_20260627_104423_initial.down,
    name: '20260627_104423_initial',
  },
  {
    up: migration_20260628_012231_add_email_logs.up,
    down: migration_20260628_012231_add_email_logs.down,
    name: '20260628_012231_add_email_logs',
  },
  {
    up: migration_20260628_021500_add_newsletter_subscribers.up,
    down: migration_20260628_021500_add_newsletter_subscribers.down,
    name: '20260628_021500_add_newsletter_subscribers',
  },
  {
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
    name: '20260704_064359_add_order_status_timestamps_for_timeline'
  },
];
