import { PrismaClient } from '@prisma/client'
import { pbkdf2Sync, randomBytes } from 'crypto'
import { seoSeedPages } from '../lib/seo/seed-pages'
import { blogSeedPosts } from '../lib/blog/seed-posts'
import { templateSeedItems } from '../lib/templates/seed-templates'
import { officialResourceSeeds } from '../lib/resources/seed-resources'
import { filingGuideSeeds } from '../lib/filing/seed-guides'
import { authorityDirectorySeeds } from '../lib/authority/seed-authorities'
import { seoKeywordOpportunitySeeds } from '../lib/seo/keyword-opportunities'
import { stateGuideSeeds } from '../lib/state/seed-state-guides'
import { successStorySeeds } from '../lib/stories/seed-success-stories'
import { officialLinkCheckSeeds } from '../lib/link-checks/seed-link-checks'
import { officialSourceSeeds } from '../lib/official-sources/seed-official-sources'
import { productionQaSeeds } from '../lib/qa/seed-production-qa'
import { featureFlagSeeds } from '../lib/flags/seed-feature-flags'
import { incidentReportSeeds } from '../lib/incidents/seed-incidents'
import { supportMacroSeeds } from '../lib/support/seed-macros'
import { translationSnippetSeeds } from '../lib/translations/seed-translation-snippets'
import { playbookSeeds, learningSeeds, experimentSeeds } from '../lib/phase16/seed-phase16'

const prisma = new PrismaClient()

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 120_000, 32, 'sha256').toString('hex')
  return `pbkdf2$120000$${salt}$${hash}`
}

const schemes = [
  {
    title: 'Bihar Post Matric Scholarship', slug: 'bihar-post-matric-scholarship', state: 'Bihar', purpose: 'Scholarship',
    eligibility: 'Bihar ke eligible students ke liye scholarship guidance. Category, income, course and deadline official portal par verify karna zaroori hai.',
    documents: ['Aadhaar card', 'Bank passbook', 'Income certificate', 'Caste certificate if applicable', 'Domicile certificate', 'Previous marksheet', 'Admission/fee receipt'],
    applySteps: ['Official scholarship portal open karo', 'Student registration/login complete karo', 'Documents upload karo', 'Application preview verify karo', 'Submit karke application ID save karo'],
    officialLink: null
  },
  {
    title: 'UP Scholarship Documents Guide', slug: 'up-scholarship-documents-guide', state: 'Uttar Pradesh', purpose: 'Scholarship',
    eligibility: 'UP ke students ke liye scholarship document and application guide. Exact eligibility official scholarship notification se confirm karein.',
    documents: ['Aadhaar card', 'Bank passbook', 'Income certificate', 'Caste certificate if applicable', 'Previous marksheet', 'Fee receipt', 'Domicile/residence proof'],
    applySteps: ['Official UP scholarship portal par registration karo', 'Institute/course details carefully fill karo', 'Documents upload/verify karo', 'Final print/save karo'],
    officialLink: null
  },
  {
    title: 'Ayushman Card Basic Eligibility Guide', slug: 'ayushman-card-basic-eligibility-guide', state: 'Other', purpose: 'Health',
    eligibility: 'Ayushman card eligibility government list/official portal ke basis par hoti hai. HaqSathi sirf checklist aur process guidance deta hai.',
    documents: ['Aadhaar card', 'Ration card/family ID if required', 'Mobile number', 'Identity proof'],
    applySteps: ['Eligibility official portal/CSC par check karo', 'Family/member details verify karo', 'Required documents do', 'Acknowledgement/card status save karo'],
    officialLink: null
  }
]

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456'
  await prisma.user.upsert({
    where: { email: 'admin@haqsathi.local' },
    update: { role: 'ADMIN', plan: 'AGENT', password: hashPassword(adminPassword) },
    create: { name: 'HaqSathi Admin', email: 'admin@haqsathi.local', password: hashPassword(adminPassword), role: 'ADMIN', plan: 'AGENT', authProvider: 'email' }
  })

  await prisma.user.upsert({
    where: { email: 'demo@haqsathi.local' },
    update: { plan: 'PRO', password: hashPassword('Demo@123456') },
    create: { name: 'Demo User', email: 'demo@haqsathi.local', password: hashPassword('Demo@123456'), role: 'USER', plan: 'PRO', authProvider: 'email' }
  })

  for (const page of seoSeedPages) {
    await prisma.seoPage.upsert({
      where: { type_slug: { type: page.type, slug: page.slug } },
      update: { title: page.title, metaDescription: page.metaDescription, content: page, faqJson: page.faqs },
      create: { type: page.type, slug: page.slug, title: page.title, metaDescription: page.metaDescription, content: page, faqJson: page.faqs }
    })
  }



  for (const post of blogSeedPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        category: post.category,
        tags: post.tags,
        content: post.content,
        faqs: post.faqs,
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        category: post.category,
        tags: post.tags,
        content: post.content,
        faqs: post.faqs,
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    })
  }


  for (const template of templateSeedItems) {
    await prisma.template.upsert({
      where: { slug: template.slug },
      update: template,
      create: template
    })
  }

  for (const resource of officialResourceSeeds) {
    await prisma.officialResource.upsert({
      where: { slug: resource.slug },
      update: resource,
      create: resource
    })
  }


  for (const guide of filingGuideSeeds) {
    await prisma.officialFilingGuide.upsert({
      where: { slug: guide.slug },
      update: guide,
      create: guide
    })
  }



  for (const authority of authorityDirectorySeeds) {
    await prisma.authorityDirectoryEntry.upsert({
      where: { slug: authority.slug },
      update: authority,
      create: authority
    })
  }

  for (const keyword of seoKeywordOpportunitySeeds) {
    await prisma.seoKeywordOpportunity.upsert({
      where: { keyword: keyword.keyword },
      update: keyword,
      create: keyword
    })
  }


  for (const guide of stateGuideSeeds) {
    await prisma.stateGuide.upsert({
      where: { slug: guide.slug },
      update: guide,
      create: guide
    })
  }

  for (const story of successStorySeeds) {
    await prisma.successStory.upsert({
      where: { slug: story.slug },
      update: story,
      create: story
    })
  }

  for (const link of officialLinkCheckSeeds) {
    await prisma.officialLinkCheck.upsert({
      where: { label_category_state: { label: link.label, category: link.category, state: link.state } },
      update: link as any,
      create: link as any
    })
  }



  for (const source of officialSourceSeeds) {
    await prisma.officialSource.upsert({
      where: { slug: source.slug },
      update: source,
      create: source
    })
  }

  for (const qa of productionQaSeeds) {
    const existing = await prisma.productionQaRun.findFirst({ where: { area: qa.area, device: qa.device, browser: qa.browser } })
    if (existing) await prisma.productionQaRun.update({ where: { id: existing.id }, data: qa as any })
    else await prisma.productionQaRun.create({ data: qa as any })
  }

  for (const flag of featureFlagSeeds) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: flag as any,
      create: flag as any
    })
  }

  for (const incident of incidentReportSeeds) {
    const existing = await prisma.incidentReport.findFirst({ where: { title: incident.title } })
    if (existing) await prisma.incidentReport.update({ where: { id: existing.id }, data: incident as any })
    else await prisma.incidentReport.create({ data: incident as any })
  }

  for (const macro of supportMacroSeeds) {
    await prisma.supportMacro.upsert({
      where: { slug: macro.slug },
      update: macro as any,
      create: macro as any
    })
  }

  for (const snippet of translationSnippetSeeds) {
    await prisma.translationSnippet.upsert({
      where: { key_locale: { key: snippet.key, locale: snippet.locale } },
      update: snippet as any,
      create: snippet as any
    })
  }


  for (const playbook of playbookSeeds) {
    await prisma.playbookArticle.upsert({ where: { slug: playbook.slug }, update: playbook as any, create: playbook as any })
  }

  for (const item of learningSeeds) {
    await prisma.learningPathItem.upsert({ where: { slug: item.slug }, update: item as any, create: item as any })
  }

  for (const experiment of experimentSeeds) {
    await prisma.experiment.upsert({ where: { key: experiment.key }, update: experiment as any, create: experiment as any })
  }

  for (const scheme of schemes) {
    await prisma.scheme.upsert({
      where: { state_slug: { state: scheme.state, slug: scheme.slug } },
      update: scheme,
      create: scheme
    })
  }

  console.log(`Seeded ${seoSeedPages.length} SEO pages, ${blogSeedPosts.length} blog posts, ${templateSeedItems.length} templates, ${officialResourceSeeds.length} resources, ${filingGuideSeeds.length} filing guides, ${authorityDirectorySeeds.length} authorities, ${seoKeywordOpportunitySeeds.length} keyword ideas, ${stateGuideSeeds.length} state guides, ${successStorySeeds.length} success stories, ${officialLinkCheckSeeds.length} link checks, ${officialSourceSeeds.length} official sources, ${featureFlagSeeds.length} flags, ${supportMacroSeeds.length} support macros, ${translationSnippetSeeds.length} translations, ${playbookSeeds.length} playbooks, ${learningSeeds.length} learning items, ${experimentSeeds.length} experiments, ${schemes.length} schemes, admin and demo users.`)
  console.log('Admin login: admin@haqsathi.local / ' + adminPassword)
  console.log('Demo login: demo@haqsathi.local / Demo@123456')
}

main()
  .catch((error) => { console.error(error); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
