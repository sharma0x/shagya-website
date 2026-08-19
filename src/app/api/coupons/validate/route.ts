import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    const { code, subtotal, productIds } = await request.json()
    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Please enter a coupon code' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })
    const normalizedCode = code.trim().toUpperCase()

    // Find coupon
    const coupons = await payload.find({
      collection: 'coupons',
      where: { code: { equals: normalizedCode } },
      limit: 1,
    })

    if (coupons.docs.length === 0) {
      return NextResponse.json(
        { valid: false, error: 'Invalid coupon code' },
        { status: 200 },
      )
    }

    const coupon = coupons.docs[0] as any

    // Check active
    if (!coupon.isActive) {
      return NextResponse.json(
        { valid: false, error: 'This coupon is no longer active' },
        { status: 200 },
      )
    }

    // Check dates
    const now = new Date()
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return NextResponse.json(
        { valid: false, error: 'This coupon is not yet active' },
        { status: 200 },
      )
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return NextResponse.json(
        { valid: false, error: 'This coupon has expired' },
        { status: 200 },
      )
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { valid: false, error: 'This coupon has reached its usage limit' },
        { status: 200 },
      )
    }

    // Check per-user usage limit
    if (coupon.perUserUsageLimit && session?.user) {
      const customers = await payload.find({
        collection: 'customers',
        where: { betterAuthUserId: { equals: session.user.id } },
        limit: 1,
      })
      if (customers.docs.length > 0) {
        const customerEmail = customers.docs[0].email
        const pastOrders = await payload.count({
          collection: 'orders',
          where: {
            and: [
              { customerEmail: { equals: customerEmail } },
              { coupon: { equals: coupon.id } },
              { status: { not_equals: 'cancelled' } },
            ],
          },
        })
        if (pastOrders.totalDocs >= coupon.perUserUsageLimit) {
          return NextResponse.json(
            {
              valid: false,
              error: 'You have already reached the usage limit for this coupon',
            },
            { status: 200 },
          )
        }
      }
    }

    // Check minimum cart value
    if (coupon.minCartValue && subtotal < coupon.minCartValue) {
      const shortage = coupon.minCartValue - subtotal
      return NextResponse.json(
        {
          valid: false,
          error: `Add items worth ₹${shortage.toLocaleString('en-IN')} more to apply ${normalizedCode}`,
        },
        { status: 200 },
      )
    }

    // Check customer conditions
    if (coupon.customersConditions?.length > 0) {
      if (!session?.user) {
        return NextResponse.json(
          { valid: false, error: 'Please log in to use this exclusive offer' },
          { status: 200 },
        )
      }

      const customers = await payload.find({
        collection: 'customers',
        where: { betterAuthUserId: { equals: session.user.id } },
        limit: 1,
      })
      if (customers.docs.length === 0) {
        return NextResponse.json(
          { valid: false, error: 'Customer not found' },
          { status: 200 },
        )
      }
      const customerId = String(customers.docs[0].id)
      const allowedIds = coupon.customersConditions.map((c: any) =>
        String(typeof c === 'object' ? c.id : c),
      )
      if (!allowedIds.includes(customerId)) {
        return NextResponse.json(
          {
            valid: false,
            error: `${normalizedCode} is an exclusive offer — not available for your account`,
          },
          { status: 200 },
        )
      }
    }

    // Check product / collection conditions
    const hasProductConditions = coupon.productsConditions?.length > 0
    const hasCollectionConditions = coupon.collectionsConditions?.length > 0

    if (
      (hasProductConditions || hasCollectionConditions) &&
      productIds?.length
    ) {
      const conditionProductIds = hasProductConditions
        ? coupon.productsConditions.map((p: any) =>
            String(typeof p === 'object' ? p.id : p),
          )
        : []

      const conditionCollectionIds = hasCollectionConditions
        ? coupon.collectionsConditions.map((c: any) =>
            String(typeof c === 'object' ? c.id : c),
          )
        : []

      // Check if ANY product in cart matches product conditions
      const productMatch = hasProductConditions
        ? productIds.some((pid: string) =>
            conditionProductIds.includes(String(pid)),
          )
        : false

      // Check if ANY product in cart belongs to allowed collections
      let collectionMatch = false
      if (hasCollectionConditions && !productMatch) {
        const cartProducts = await payload.find({
          collection: 'products',
          where: { id: { in: productIds.map((id: string) => Number(id)) } },
          depth: 0,
          limit: 100,
          pagination: false,
        })
        collectionMatch = (cartProducts.docs as any[]).some((p: any) => {
          const colIds =
            p.collections?.map((c: any) =>
              String(typeof c === 'object' ? c.id : c),
            ) || []
          return colIds.some((cid: string) =>
            conditionCollectionIds.includes(cid),
          )
        })
      }

      if (!productMatch && !collectionMatch) {
        let hint = ''
        if (hasProductConditions) {
          const productDocs = await payload.find({
            collection: 'products',
            where: { id: { in: conditionProductIds.map(Number) } },
            depth: 0,
            limit: 3,
            pagination: false,
          })
          const names = (productDocs.docs as any[]).map((p: any) => p.name)
          if (names.length === 1) {
            hint = `Add '${names[0]}' to your cart`
          } else if (names.length > 1) {
            hint = `Add products like '${names[0]}' or '${names[1]}'`
          }
        } else if (hasCollectionConditions) {
          const collectionDocs = await payload.find({
            collection: 'collections',
            where: { id: { in: conditionCollectionIds.map(Number) } },
            depth: 0,
            limit: 3,
            pagination: false,
          })
          const names = (collectionDocs.docs as any[]).map((c: any) => c.name)
          if (names.length === 1) {
            hint = `Add ${names[0].toLowerCase()} products to your cart`
          } else if (names.length > 1) {
            hint = `Add ${names.map((n: string) => n.toLowerCase()).join(' or ')} products`
          }
        }
        return NextResponse.json(
          {
            valid: false,
            error:
              hint || `${normalizedCode} does not apply to items in your cart`,
          },
          { status: 200 },
        )
      }
    }

    // Calculate discount
    let discount = 0
    if (coupon.type === 'percentage') {
      discount = Math.round((subtotal * coupon.value) / 100)
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    } else if (coupon.type === 'fixed_amount') {
      discount = coupon.value
    } else if (coupon.type === 'free_shipping') {
      discount = 0 // handled separately
    }

    // Return coupon data (not the full doc to avoid exposing conditions)
    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        maxDiscount: coupon.maxDiscount,
        discount,
      },
    })
  } catch (error) {
    console.error('[API] POST /api/coupons/validate error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
