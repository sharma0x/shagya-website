import type { Payload } from 'payload'
import type { TemplateSlug } from '@/collections/EmailTemplates'
import { DEFAULT_TEMPLATES } from './defaults'

type Vars = Record<string, string>

function interpolate(text: string, vars: Vars): string {
  return text.replace(
    /\{\{(\w+)\}\}/g,
    (_, key: string) => vars[key] ?? `{{${key}}}`,
  )
}

async function loadTemplate(
  payload: Payload,
  slug: TemplateSlug,
): Promise<{ subject: string; body: string }> {
  try {
    const result = await payload.find({
      collection: 'email-templates',
      where: {
        and: [{ slug: { equals: slug } }, { isActive: { equals: true } }],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (result.docs.length > 0) {
      const doc = result.docs[0] as unknown as Record<string, unknown>
      if (doc.subject && doc.body) {
        return { subject: doc.subject as string, body: doc.body as string }
      }
    }
  } catch (err) {
    payload.logger.warn(
      `[Email] Cannot load DB template "${slug}", using default: ${err}`,
    )
  }

  return DEFAULT_TEMPLATES[slug]
}

export async function renderEmail(
  payload: Payload,
  slug: TemplateSlug,
  vars: Vars,
): Promise<{ subject: string; html: string }> {
  const template = await loadTemplate(payload, slug)
  return {
    subject: interpolate(template.subject, vars),
    html: interpolate(template.body, vars),
  }
}
