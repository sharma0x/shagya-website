export type DelhiveryMode = 'test' | 'prod'

export type WaybillResponse =
  | string
  | string[]
  | { data?: Array<string | number> }

export interface ShipmentRequest {
  name: string
  order: string
  phone: string
  add: string
  pin: string
  city: string
  state: string
  country: string
  payment_mode: 'Prepaid' | 'COD'
  pickup_location: string
  weight: number
  quantity: number
  total_amount: number
  products_desc: string
  seller_name: string
  seller_add: string
  seller_phone: string
  seller_email?: string
  return_name: string
  return_add: string
  return_city: string
  return_state: string
  return_pin: string
  return_phone: string
  waybill?: string
  cod_amount?: number
  hsn_code?: string
  ewaybill?: string
  shipment_width?: number
  shipment_height?: number
  shipment_length?: number
  fragile_shipment?: boolean
}

export interface ShipmentResult {
  waybill?: string
  order?: string
  status?: string
}

export interface ShipmentPackage {
  waybill?: string
  refnum?: string
  status?: string
  remarks?: string[]
  serviceable?: boolean
}

export interface ShipmentResponse {
  success?: boolean
  rmk?: string
  packages?: ShipmentPackage[]
  shipments?: ShipmentResult[]
  packages_queued?: boolean
}

export interface PostalCodeDetail {
  pin?: number | string
  pre_paid?: string
  cod?: string
  pickup?: string
  repl?: string
  district?: string
  state_code?: string
  city?: string
  max_weight?: number
}

export interface PincodeServiceabilityResponse {
  delivery_codes?: { postal_code?: PostalCodeDetail }[]
}

export interface TrackingShipment {
  AWB?: string
  Shipment_Status?: string
}

export interface TrackingResponse {
  shipments?: TrackingShipment[]
}

export interface PickupRequestResponse {
  pickup_id?: string | number
  pickup_request_id?: string
}

export interface DelhiveryScan {
  status_type?: string
  status?: string
  description?: string
  scanned_date?: string
  waybill?: string
  order_id?: string
}
