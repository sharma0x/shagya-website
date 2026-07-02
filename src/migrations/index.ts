import * as migration_20260627_104423_initial from './20260627_104423_initial';
import * as migration_20260628_012231_add_email_logs from './20260628_012231_add_email_logs';
import * as migration_20260628_021500_add_newsletter_subscribers from './20260628_021500_add_newsletter_subscribers';
import * as migration_20260628_091813_totp_secret_for_users from './20260628_091813_totp_secret_for_users';
import * as migration_20260702_120116_add_discount_delivery_time_and_city_of_origin_filters from './20260702_120116_add_discount_delivery_time_and_city_of_origin_filters';
import * as migration_20260702_202856_add_purchaseCount_backInStockRequests_and_trending from './20260702_202856_add_purchaseCount_backInStockRequests_and_trending';

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
    name: '20260702_202856_add_purchaseCount_backInStockRequests_and_trending'
  },
];
