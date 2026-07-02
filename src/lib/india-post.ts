const INDIA_POST_BASE = 'https://api.postalpincode.in'

export interface PostOffice {
  Name: string
  BranchType: string
  DeliveryStatus: string
  Circle: string
  District: string
  Division: string
  Region: string
  Block: string
  State: string
  Country: string
  Pincode: string
}

interface IndiaPostResponse {
  Message: string
  Status: string
  PostOffice: PostOffice[] | null
}

export interface PincodeResult {
  pincode: string
  city: string
  district: string
  state: string
  country: string
  postOffices: Pick<PostOffice, 'Name' | 'BranchType' | 'DeliveryStatus'>[]
}

export interface CitySearchResult {
  city: string
  state: string
  district: string
  pincodes: string[]
}

export async function lookupPincode(pincode: string): Promise<PincodeResult | null> {
  const res = await fetch(`${INDIA_POST_BASE}/pincode/${encodeURIComponent(pincode)}`, {
    signal: AbortSignal.timeout(5000),
  })

  if (!res.ok) return null

  const data: IndiaPostResponse[] = await res.json()

  if (!Array.isArray(data) || data.length === 0) return null
  if (data[0].Status !== 'Success' || !data[0].PostOffice || data[0].PostOffice.length === 0) {
    return null
  }

  const offices = data[0].PostOffice
  const main = offices[0]

  return {
    pincode: main.Pincode,
    city: main.Name,
    district: main.District,
    state: main.State,
    country: main.Country,
    postOffices: offices.map((po) => ({
      Name: po.Name,
      BranchType: po.BranchType,
      DeliveryStatus: po.DeliveryStatus,
    })),
  }
}

export async function searchCity(city: string): Promise<CitySearchResult[]> {
  const res = await fetch(
    `${INDIA_POST_BASE}/postoffice/${encodeURIComponent(city)}`,
    { signal: AbortSignal.timeout(5000) }
  )

  if (!res.ok) return []

  const data: IndiaPostResponse[] = await res.json()

  if (!Array.isArray(data) || data.length === 0) return []
  if (data[0].Status !== 'Success' || !data[0].PostOffice) return []

  const grouped = new Map<string, { state: string; district: string; pincodes: Set<string> }>()

  for (const po of data[0].PostOffice) {
    const key = po.Name
    if (!grouped.has(key)) {
      grouped.set(key, { state: po.State, district: po.District, pincodes: new Set() })
    }
    grouped.get(key)!.pincodes.add(po.Pincode)
  }

  return Array.from(grouped.entries()).map(([cityName, info]) => ({
    city: cityName,
    state: info.state,
    district: info.district,
    pincodes: Array.from(info.pincodes),
  }))
}
