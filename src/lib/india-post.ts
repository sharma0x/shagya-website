const INDIA_POST_BASE = 'https://api.postalpincode.in'
const RETRY_DELAY_MS = 200

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

export interface IndiaPostResponse {
  Message: string
  Status: string
  PostOffice: PostOffice[] | null
}

export interface PincodeResult {
  pincode: string
  /**
   * The upstream API does not expose a real `city` field. India Post returns a
   * list of post offices (PO) for a pincode, and each PO has `Name`, `District`,
   * and `Block` fields. We best-effort derive a city by:
   *   1. preferring `District` (e.g. "Central Delhi")
   *   2. falling back to `Block` (often the actual city, e.g. "New Delhi")
   *   3. falling back to the first PO's `Name` as a last resort
   * For some pincodes this will be wrong (the upstream has no real city field).
   * Use `postOfficeName` for the post office display name.
   */
  city: string
  /**
   * Name of the first (alphabetically) post office for this pincode.
   * The upstream returns a list of POs; we surface the first as a convenience.
   * For example, pincode 110001's first PO is "Connaught Place".
   */
  postOfficeName: string
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

async function fetchWithRetry(url: string): Promise<Response> {
  const doFetch = () => fetch(url, { signal: AbortSignal.timeout(5000) })

  const first = await doFetch()

  if (first.status < 500) return first

  // Single retry on transient 5xx with short backoff
  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
  return doFetch()
}

export async function lookupPincode(
  pincode: string,
): Promise<PincodeResult | null> {
  let res: Response
  try {
    res = await fetchWithRetry(
      `${INDIA_POST_BASE}/pincode/${encodeURIComponent(pincode)}`,
    )
  } catch {
    return null
  }

  if (!res.ok) return null

  const data: IndiaPostResponse[] = await res.json()

  if (!Array.isArray(data) || data.length === 0) return null
  if (
    data[0].Status !== 'Success' ||
    !data[0].PostOffice ||
    data[0].PostOffice.length === 0
  ) {
    return null
  }

  const offices = data[0].PostOffice
  const main = offices[0]

  return {
    pincode: main.Pincode,
    postOfficeName: main.Name.trim(),
    city: main.District ?? main.Block ?? main.Name,
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
  let res: Response
  try {
    res = await fetchWithRetry(
      `${INDIA_POST_BASE}/postoffice/${encodeURIComponent(city)}`,
    )
  } catch {
    return []
  }

  if (!res.ok) return []

  const data: IndiaPostResponse[] = await res.json()

  if (!Array.isArray(data) || data.length === 0) return []
  if (data[0].Status !== 'Success' || !data[0].PostOffice) return []

  const grouped = new Map<
    string,
    { name: string; state: string; district: string; pincodes: Set<string> }
  >()

  for (const po of data[0].PostOffice) {
    // Group by Name + State — a "Central" PO in Maharashtra and a "Central" PO
    // in Tamil Nadu are distinct entries.
    const key = `${po.Name}|${po.State}`
    if (!grouped.has(key)) {
      grouped.set(key, {
        name: po.Name,
        state: po.State,
        district: po.District,
        pincodes: new Set(),
      })
    }
    grouped.get(key)!.pincodes.add(po.Pincode)
  }

  return Array.from(grouped.values()).map((info) => ({
    city: info.name,
    state: info.state,
    district: info.district,
    pincodes: Array.from(info.pincodes),
  }))
}
