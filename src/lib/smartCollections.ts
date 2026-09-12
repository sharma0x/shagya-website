import { Block } from 'payload'

export const BrandRule: Block = {
  slug: 'brandRule',
  labels: { singular: 'Brand Condition', plural: 'Brand Conditions' },
  fields: [
    {
      name: 'operator',
      type: 'select',
      options: [
        { label: 'Equals', value: 'equals' },
        { label: 'Not Equals', value: 'not_equals' },
      ],
      defaultValue: 'equals',
      required: true,
    },
    {
      name: 'value',
      type: 'relationship',
      relationTo: 'brands',
      required: true,
    },
  ],
}

export const FabricRule: Block = {
  slug: 'fabricRule',
  labels: { singular: 'Fabric Condition', plural: 'Fabric Conditions' },
  fields: [
    {
      name: 'operator',
      type: 'select',
      options: [
        { label: 'Equals', value: 'equals' },
        { label: 'Not Equals', value: 'not_equals' },
      ],
      defaultValue: 'equals',
      required: true,
    },
    {
      name: 'value',
      type: 'select',
      options: [
        { label: 'Silk', value: 'silk' },
        { label: 'Cotton', value: 'cotton' },
        { label: 'Linen', value: 'linen' },
        { label: 'Georgette', value: 'georgette' },
        { label: 'Chiffon', value: 'chiffon' },
        { label: 'Crepe', value: 'crepe' },
        { label: 'Velvet', value: 'velvet' },
        { label: 'Net', value: 'net' },
        { label: 'Blend', value: 'blend' },
      ],
      required: true,
    },
  ],
}

export const PriceRule: Block = {
  slug: 'priceRule',
  labels: { singular: 'Price Condition', plural: 'Price Conditions' },
  fields: [
    {
      name: 'operator',
      type: 'select',
      options: [
        { label: 'Equals', value: 'equals' },
        { label: 'Greater Than', value: 'greater_than' },
        { label: 'Less Than', value: 'less_than' },
      ],
      required: true,
    },
    {
      name: 'value',
      type: 'number',
      required: true,
    },
  ],
}

export const TagRule: Block = {
  slug: 'tagRule',
  labels: { singular: 'Tag Condition', plural: 'Tag Conditions' },
  fields: [
    {
      name: 'operator',
      type: 'select',
      options: [
        { label: 'Equals', value: 'equals' },
        { label: 'Contains', value: 'contains' },
      ],
      defaultValue: 'contains',
      required: true,
    },
    {
      name: 'value',
      type: 'text',
      required: true,
    },
  ],
}

export const OccasionRule: Block = {
  slug: 'occasionRule',
  labels: { singular: 'Occasion Condition', plural: 'Occasion Conditions' },
  fields: [
    {
      name: 'operator',
      type: 'select',
      options: [
        { label: 'Equals', value: 'equals' },
        { label: 'Not Equals', value: 'not_equals' },
      ],
      defaultValue: 'equals',
      required: true,
    },
    {
      name: 'value',
      type: 'relationship',
      relationTo: 'occasions',
      required: true,
    },
  ],
}

/**
 * Evaluates a single product against a smart collection's rules.
 */
export function evaluateProductAgainstRules(
  product: any,
  matchType: 'all' | 'any',
  rules: any[],
): boolean {
  if (!rules || rules.length === 0) return false

  const evaluateRule = (rule: any): boolean => {
    switch (rule.blockType) {
      case 'brandRule': {
        const productBrandId =
          typeof product.brand === 'object' ? product.brand?.id : product.brand
        const targetBrandId =
          typeof rule.value === 'object' ? rule.value?.id : rule.value

        if (rule.operator === 'equals') {
          return String(productBrandId) === String(targetBrandId)
        }
        if (rule.operator === 'not_equals') {
          return String(productBrandId) !== String(targetBrandId)
        }
        break
      }
      case 'fabricRule': {
        const pFabric = product.fabric
        const target = rule.value

        if (rule.operator === 'equals') return pFabric === target
        if (rule.operator === 'not_equals') return pFabric !== target
        break
      }
      case 'priceRule': {
        const price = Number(product.basePrice || 0)
        const target = Number(rule.value || 0)

        if (rule.operator === 'equals') return price === target
        if (rule.operator === 'greater_than') return price > target
        if (rule.operator === 'less_than') return price < target
        break
      }
      case 'tagRule': {
        const productTags = String(product.tags || '').toLowerCase()
        const targetTag = String(rule.value || '').toLowerCase()

        if (!productTags) return false

        if (rule.operator === 'equals') {
          return productTags
            .split(',')
            .map((t) => t.trim())
            .includes(targetTag)
        }
        if (rule.operator === 'contains') {
          return productTags.includes(targetTag)
        }
        break
      }
      case 'occasionRule': {
        const targetId = String(
          typeof rule.value === 'object' ? rule.value?.id : rule.value,
        )
        const productOccasions = (product.occasions || []).map((occ: any) =>
          String(typeof occ === 'object' ? occ.id : occ),
        )

        if (rule.operator === 'equals') {
          return productOccasions.includes(targetId)
        }
        if (rule.operator === 'not_equals') {
          return !productOccasions.includes(targetId)
        }
        break
      }
    }
    return false
  }

  if (matchType === 'any') {
    return rules.some(evaluateRule)
  }

  // Default to 'all'
  return rules.every(evaluateRule)
}
