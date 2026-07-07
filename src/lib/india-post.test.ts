import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { lookupPincode, searchCity } from './india-post'

// @vitest-environment node

const SUCCESS_OFFICE = {
  Name: 'New Delhi ',
  Description: null,
  BranchType: 'Head Post Office',
  DeliveryStatus: 'Delivery',
  Circle: 'Delhi',
  District: 'New Delhi',
  Division: 'New Delhi GPO',
  Region: 'Delhi',
  Block: 'New Delhi',
  State: 'Delhi',
  Country: 'India',
  Pincode: '110001',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

describe('lookupPincode', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns null on 404 from upstream', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 404)))

    const result = await lookupPincode('999999')

    expect(result).toBeNull()
  })

  it('returns null on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')))

    const result = await lookupPincode('110001')

    expect(result).toBeNull()
  })

  it('returns null on AbortError from timeout', async () => {
    const abortError = new DOMException(
      'The operation was aborted',
      'AbortError',
    )
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))

    const result = await lookupPincode('110001')

    expect(result).toBeNull()
  })

  it('returns null on malformed upstream response (not an array)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ foo: 'bar' })),
    )

    const result = await lookupPincode('110001')

    expect(result).toBeNull()
  })

  it('returns null on empty upstream array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([])))

    const result = await lookupPincode('110001')

    expect(result).toBeNull()
  })

  it('returns null when Status is not Success', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse([
            { Message: 'No records found', Status: 'Error', PostOffice: null },
          ]),
        ),
    )

    const result = await lookupPincode('000000')

    expect(result).toBeNull()
  })

  it('returns null when PostOffice is null', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse([{ Message: '', Status: 'Success', PostOffice: null }]),
        ),
    )

    const result = await lookupPincode('110001')

    expect(result).toBeNull()
  })

  it('returns null when PostOffice is empty array', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse([{ Message: '', Status: 'Success', PostOffice: [] }]),
        ),
    )

    const result = await lookupPincode('110001')

    expect(result).toBeNull()
  })

  it('returns a PincodeResult on 200 with valid upstream data', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse([
            { Message: 'ok', Status: 'Success', PostOffice: [SUCCESS_OFFICE] },
          ]),
        ),
    )

    const result = await lookupPincode('110001')

    expect(result).not.toBeNull()
    expect(result!.pincode).toBe('110001')
    expect(result!.district).toBe('New Delhi')
    expect(result!.state).toBe('Delhi')
    expect(result!.country).toBe('India')
    // The upstream "New Delhi " has a trailing space — we trim it for display
    expect(result!.postOfficeName).toBe('New Delhi')
    // The "city" field is best-effort derived from District/Block
    expect(typeof result!.city).toBe('string')
  })

  it('exposes postOfficeName as the upstream post office Name', async () => {
    const connaughtPlace = {
      ...SUCCESS_OFFICE,
      Name: 'Connaught Place',
      BranchType: 'Sub Post Office',
      District: 'Central Delhi',
      Block: 'New Delhi',
    }
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse([
            { Message: 'ok', Status: 'Success', PostOffice: [connaughtPlace] },
          ]),
        ),
    )

    const result = await lookupPincode('110001')

    expect(result!.postOfficeName).toBe('Connaught Place')
    // City should NOT be the post office name
    expect(result!.city).not.toBe('Connaught Place')
  })

  it('lists all post offices with only Name, BranchType, DeliveryStatus', async () => {
    const office2 = {
      ...SUCCESS_OFFICE,
      Name: 'Connaught Place',
      BranchType: 'Sub Post Office',
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse([
          {
            Message: 'ok',
            Status: 'Success',
            PostOffice: [SUCCESS_OFFICE, office2],
          },
        ]),
      ),
    )

    const result = await lookupPincode('110001')

    expect(result!.postOffices).toHaveLength(2)
    expect(result!.postOffices[0]).toEqual({
      Name: 'New Delhi ',
      BranchType: 'Head Post Office',
      DeliveryStatus: 'Delivery',
    })
    expect(result!.postOffices[1]).toEqual({
      Name: 'Connaught Place',
      BranchType: 'Sub Post Office',
      DeliveryStatus: 'Delivery',
    })
  })

  it('retries once on a 5xx response', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 503))
      .mockResolvedValueOnce(
        jsonResponse([
          { Message: 'ok', Status: 'Success', PostOffice: [SUCCESS_OFFICE] },
        ]),
      )
    vi.stubGlobal('fetch', mockFetch)

    const result = await lookupPincode('110001')

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(result).not.toBeNull()
  })

  it('encodes the pincode in the URL', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(
        jsonResponse([
          { Message: '', Status: 'Success', PostOffice: [SUCCESS_OFFICE] },
        ]),
      )
    vi.stubGlobal('fetch', mockFetch)

    await lookupPincode('110001')

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/pincode/110001')
  })
})

describe('searchCity', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns an empty array on 404 from upstream', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 404)))

    const result = await searchCity('Atlantis')

    expect(result).toEqual([])
  })

  it('returns an empty array when upstream has no results', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse([
            { Message: 'No records', Status: 'Error', PostOffice: null },
          ]),
        ),
    )

    const result = await searchCity('Atlantis')

    expect(result).toEqual([])
  })

  it('returns an empty array on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')))

    const result = await searchCity('Mumbai')

    expect(result).toEqual([])
  })

  it('returns an array of distinct entries on 200', async () => {
    const offices = [
      {
        ...SUCCESS_OFFICE,
        Name: 'Mumbai Central',
        Pincode: '400008',
        District: 'Mumbai',
        State: 'Maharashtra',
      },
      {
        ...SUCCESS_OFFICE,
        Name: 'Mumbai Central',
        Pincode: '400008',
        District: 'Mumbai',
        State: 'Maharashtra',
      },
    ]
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse([
            { Message: 'ok', Status: 'Success', PostOffice: offices },
          ]),
        ),
    )

    const result = await searchCity('Mumbai Central')

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      state: 'Maharashtra',
      district: 'Mumbai',
    })
    expect(result[0].pincodes).toContain('400008')
  })

  it('keeps same-name post offices in different states distinct', async () => {
    const offices = [
      {
        ...SUCCESS_OFFICE,
        Name: 'Central',
        Pincode: '400020',
        District: 'Mumbai',
        State: 'Maharashtra',
      },
      {
        ...SUCCESS_OFFICE,
        Name: 'Central',
        Pincode: '141008',
        District: 'Ludhiana',
        State: 'Punjab',
      },
    ]
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse([
            { Message: 'ok', Status: 'Success', PostOffice: offices },
          ]),
        ),
    )

    const result = await searchCity('Central')

    expect(result).toHaveLength(2)
    const states = result.map((r) => r.state).sort()
    expect(states).toEqual(['Maharashtra', 'Punjab'])
  })

  it('groups multiple pincodes under the same name+state', async () => {
    const offices = [
      {
        ...SUCCESS_OFFICE,
        Name: 'Mumbai',
        Pincode: '400001',
        District: 'Mumbai',
        State: 'Maharashtra',
      },
      {
        ...SUCCESS_OFFICE,
        Name: 'Mumbai',
        Pincode: '400002',
        District: 'Mumbai',
        State: 'Maharashtra',
      },
    ]
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse([
            { Message: 'ok', Status: 'Success', PostOffice: offices },
          ]),
        ),
    )

    const result = await searchCity('Mumbai')

    expect(result).toHaveLength(1)
    expect(result[0].pincodes.sort()).toEqual(['400001', '400002'])
  })
})
