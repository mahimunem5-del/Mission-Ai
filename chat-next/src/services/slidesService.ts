export interface SlideTemplate {
  id: string;
  title: string;
  category: string;
  isPro: boolean;
  description: string;
  img: string;
  defaultPrompt: string;
  defaultTone: string;
  defaultMode: string;
}

export interface SlideAttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

export type SlideItem =
  | {
      type: 'cover';
      slideNum: number;
      pill: string;
      title: string;
      subtitle: string;
      meta: string;
      footerNote: string;
    }
  | {
      type: 'overview';
      slideNum: number;
      pill: string;
      title: string;
      subtitle: string;
      points: Array<{ label: string; desc: string }>;
    }
  | {
      type: 'features';
      slideNum: number;
      pill: string;
      title: string;
      subtitle: string;
      cards: Array<{ icon: string; title: string; desc: string }>;
    }
  | {
      type: 'process';
      slideNum: number;
      pill: string;
      title: string;
      subtitle: string;
      phases: Array<{ step: string; title: string; detail: string }>;
    }
  | {
      type: 'metrics';
      slideNum: number;
      pill: string;
      title: string;
      subtitle: string;
      stats: Array<{ value: string; label: string; sub: string }>;
    }
  | {
      type: 'conclusion';
      slideNum: number;
      pill: string;
      title: string;
      subtitle: string;
      actions: string[];
      contact: string;
    };

export const SLIDES_TEMPLATES: SlideTemplate[] = [
  {
    id: 'tmpl-project-review',
    title: 'Project Review',
    category: 'Operations',
    isPro: false,
    description: 'Milestones, key achievements, deliverables & blockers',
    img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
    defaultPrompt:
      'Quarterly Project Retrospective & Deliverables Review for Engineering and Product Teams. Outline key milestones reached, velocity metrics, blockers resolved, and upcoming sprint objectives.',
    defaultTone: 'Professional',
    defaultMode: 'Report'
  },
  {
    id: 'tmpl-pitch-deck',
    title: 'Pitch Deck',
    category: 'Startup & VC',
    isPro: false,
    description: 'Series A investor deck with market size, moat & traction',
    img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    defaultPrompt:
      'Series A Investor Pitch Deck for an Enterprise AI Platform. Cover market opportunity, solution moat, unit economics, revenue traction, competitor analysis, and fundraising targets.',
    defaultTone: 'Sales Pitch',
    defaultMode: 'Pitch Deck'
  },
  {
    id: 'tmpl-sales-report',
    title: 'Sales Report',
    category: 'Finance & Sales',
    isPro: true,
    description: 'Quarterly revenue, ARR trajectory, conversion pipelines',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    defaultPrompt:
      'Executive Q3 Sales Performance Report. Highlight total contract value, regional revenue distribution, CAC/LTV efficiency, sales cycle velocity, and Q4 forecast targets.',
    defaultTone: 'Professional',
    defaultMode: 'Report'
  },
  {
    id: 'tmpl-enterprise',
    title: 'Enterprise',
    category: 'Corporate',
    isPro: true,
    description: 'Digital transformation, cloud architecture & compliance',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    defaultPrompt:
      'Global Enterprise Digital Transformation Strategy. Outline legacy migration architecture, zero-trust security compliance, cost reduction models, and implementation phases.',
    defaultTone: 'Professional',
    defaultMode: 'Presentation'
  },
  {
    id: 'tmpl-product-overview',
    title: 'Product Overview',
    category: 'Product Launch',
    isPro: false,
    description: 'Feature architecture, UX walkthrough & value propositions',
    img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    defaultPrompt:
      'Next-Generation Product Launch Overview. Detail core platform capabilities, interactive user workflows, developer SDK integrations, and release roadmap.',
    defaultTone: 'Professional',
    defaultMode: 'Presentation'
  },
  {
    id: 'tmpl-marketing-strategy',
    title: 'Marketing Strategy',
    category: 'Growth',
    isPro: true,
    description: 'Omnichannel acquisition, persona targeting & ROAS',
    img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
    defaultPrompt:
      '2026 Omnichannel Growth Marketing Strategy. Cover brand positioning, content syndication, paid acquisition channels, organic SEO flywheel, and conversion funnel optimization.',
    defaultTone: 'Sales Pitch',
    defaultMode: 'Presentation'
  },
  {
    id: 'tmpl-education',
    title: 'Education',
    category: 'Learning',
    isPro: false,
    description: 'Structured modules, interactive lessons & key takeaways',
    img: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=600&q=80',
    defaultPrompt:
      'Introduction to Modern Artificial Intelligence & Neural Networks. Present fundamentals, deep learning paradigms, real-world case studies, and practical workshop exercises for students.',
    defaultTone: 'Educational',
    defaultMode: 'Lesson'
  },
  {
    id: 'tmpl-business-proposal',
    title: 'Business Proposal',
    category: 'Business',
    isPro: true,
    description: 'Strategic engagement, statement of work, SLA & tiers',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
    defaultPrompt:
      'Strategic Consultancy Business Proposal. Define project scope, milestone deliverables, team roles, governance model, SLA expectations, and tiered pricing structure.',
    defaultTone: 'Professional',
    defaultMode: 'Presentation'
  },
  {
    id: 'tmpl-research',
    title: 'Research',
    category: 'Academic',
    isPro: true,
    description: 'Methodology, data analysis, empirical evidence & insights',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    defaultPrompt:
      'Empirical Research Study on LLM Reasoning Capabilities in Complex Enterprise Environments. Detail experimental methodology, quantitative benchmark results, and future research directions.',
    defaultTone: 'Educational',
    defaultMode: 'Report'
  },
  {
    id: 'tmpl-portfolio',
    title: 'Portfolio',
    category: 'Creative',
    isPro: false,
    description: 'Visual identity showcase, client case studies & awards',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    defaultPrompt:
      'Design Agency Creative Portfolio & Case Studies Showcase. Highlight award-winning brand identity projects, digital product interfaces, design systems, and client testimonials.',
    defaultTone: 'Casual',
    defaultMode: 'Presentation'
  },
  {
    id: 'tmpl-case-study',
    title: 'Case Study',
    category: 'Customer Stories',
    isPro: true,
    description: 'Client transformation, problem vs solution & ROI metrics',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80',
    defaultPrompt:
      'Enterprise Customer Success Case Study: How Acme Corp automated 75% of support inquiries and reduced customer churn by 42% using intelligent workflow routing.',
    defaultTone: 'Professional',
    defaultMode: 'Report'
  },
  {
    id: 'tmpl-company-intro',
    title: 'Company Introduction',
    category: 'Corporate',
    isPro: false,
    description: 'Founding story, mission, executive team & global reach',
    img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    defaultPrompt:
      'Company Introduction & Corporate Overview Deck. Introduce our mission, leadership team, core values, global presence across 12 countries, and strategic vision for 2026-2030.',
    defaultTone: 'Professional',
    defaultMode: 'Presentation'
  }
];

export function formatSlidesFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function buildDemoDeck(
  promptText: string,
  mode: string,
  tone: string,
  count: string
): SlideItem[] {
  const cleanTopic = promptText.trim();
  const topicWords = cleanTopic.split(/\s+/).slice(0, 7).join(' ');
  const presentationTitle = cleanTopic.length > 50 ? `${topicWords}...` : cleanTopic;

  const baseSlides: SlideItem[] = [
    {
      type: 'cover',
      slideNum: 1,
      pill: `${mode.toUpperCase()} • ${tone.toUpperCase()}`,
      title: presentationTitle || 'Strategic AI Initiative',
      subtitle:
        'Comprehensive roadmap, competitive advantage, and executive implementation strategy.',
      meta: 'Prepared by Mestrio AI Studio • 2026',
      footerNote: 'Confidential & Proprietary'
    },
    {
      type: 'overview',
      slideNum: 2,
      pill: 'EXECUTIVE OVERVIEW',
      title: 'Current Landscape & Core Opportunity',
      subtitle: 'Addressing modern market shifts through accelerated capability deployment.',
      points: [
        {
          label: 'Market Drivers',
          desc: 'Rapid enterprise transition toward automated workflows and agentic intelligence.'
        },
        {
          label: 'The Core Challenge',
          desc: 'Fragmented toolchains and siloed knowledge reduce organizational agility by 40%.'
        },
        {
          label: 'Strategic Imperative',
          desc: 'Consolidating mission-critical workflows into unified generative interfaces.'
        }
      ]
    },
    {
      type: 'features',
      slideNum: 3,
      pill: 'SOLUTION ARCHITECTURE',
      title: 'Pillars of the Strategic Platform',
      subtitle: 'Engineered for reliability, velocity, and scalable team alignment.',
      cards: [
        {
          icon: 'zap',
          title: 'Real-time Generation',
          desc: 'Sub-second rendering and structured asset synthesis across modalities.'
        },
        {
          icon: 'shield-check',
          title: 'Enterprise Governance',
          desc: 'Role-based access, audit trails, and deterministic output validation.'
        },
        {
          icon: 'layers',
          title: 'Seamless Integration',
          desc: 'Turnkey SDKs and bidirectional synchronization with existing data stores.'
        }
      ]
    },
    {
      type: 'process',
      slideNum: 4,
      pill: 'EXECUTION ROADMAP',
      title: '4-Phase Implementation Framework',
      subtitle: 'Structured progression from discovery to enterprise-scale deployment.',
      phases: [
        {
          step: '01',
          title: 'Discovery & Audit',
          detail: 'Map core bottlenecks and align on success metrics.'
        },
        {
          step: '02',
          title: 'Pilot Rollout',
          detail: 'Deploy targeted workspace tools to high-impact teams.'
        },
        {
          step: '03',
          title: 'System Integration',
          detail: 'Connect shared assets, brand kits, and automated pipelines.'
        },
        {
          step: '04',
          title: 'Full Scale',
          detail: 'Global organization-wide enablement and ongoing tracking.'
        }
      ]
    },
    {
      type: 'metrics',
      slideNum: 5,
      pill: 'PROJECTED IMPACT',
      title: 'Key Performance Indicators & ROI',
      subtitle: 'Measurable outcomes modeled across conservative 12-month projections.',
      stats: [
        { value: '+185%', label: 'Delivery Velocity', sub: 'Faster deck turnaround' },
        { value: '3.4x', label: 'Efficiency Multiple', sub: 'Content throughput' },
        { value: '-62%', label: 'Production Cost', sub: 'Design operational overhead' },
        { value: '99.8%', label: 'Consistency Score', sub: 'Brand guideline adherence' }
      ]
    },
    {
      type: 'conclusion',
      slideNum: 6,
      pill: 'STRATEGIC RECOMMENDATION',
      title: 'Summary & Immediate Next Steps',
      subtitle: 'Immediate milestones required to initiate the strategic cycle.',
      actions: [
        'Finalize stakeholder review and approve technical scope statement',
        'Provision initial workspace environments and team access controls',
        'Launch Phase 1 kickoff with cross-functional leadership team'
      ],
      contact: 'Questions or feedback? Inquire at leadership@mestrio.ai'
    }
  ];

  const numSlides =
    count === 'Auto' || count === 'auto' || !count ? 6 : parseInt(count, 10) || 6;
  if (numSlides <= baseSlides.length) {
    return baseSlides.slice(0, numSlides);
  }
  const extended = [...baseSlides];
  while (extended.length < numSlides) {
    const idx = extended.length + 1;
    extended.push({
      type: 'overview',
      slideNum: idx,
      pill: `SUPPLEMENTAL MODULE ${idx}`,
      title: `Deep-Dive Analysis & Milestone ${idx}`,
      subtitle: 'Extended strategic breakdown and operational execution details.',
      points: baseSlides[1].type === 'overview' ? baseSlides[1].points : []
    });
  }
  return extended;
}

export function downloadSlidesDeck(deck: SlideItem[], promptTitle: string, tone: string): void {
  const cleanTitle = (promptTitle || 'Presentation').trim();
  const safeName =
    cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'presentation-deck';

  let content = `# ${cleanTitle || 'Presentation Deck'}\n\n`;
  content += `Export Date: ${new Date().toLocaleDateString()}\n`;
  content += `Tone: ${tone || 'Professional'} | Slides: ${deck.length}\n\n`;
  content += `============================================================\n\n`;

  deck.forEach((slide, idx) => {
    content += `SLIDE ${idx + 1}: ${slide.title}\n`;
    if (slide.pill) content += `[${slide.pill}]\n`;
    if (slide.subtitle) content += `${slide.subtitle}\n\n`;

    if (slide.type === 'overview') {
      slide.points.forEach((pt) => {
        content += `• ${pt.label}: ${pt.desc}\n`;
      });
      content += '\n';
    } else if (slide.type === 'features') {
      slide.cards.forEach((c) => {
        content += `• ${c.title}: ${c.desc}\n`;
      });
      content += '\n';
    } else if (slide.type === 'process') {
      slide.phases.forEach((ph) => {
        content += `Phase ${ph.step} - ${ph.title}: ${ph.detail}\n`;
      });
      content += '\n';
    } else if (slide.type === 'metrics') {
      slide.stats.forEach((st) => {
        content += `• ${st.value} ${st.label} (${st.sub})\n`;
      });
      content += '\n';
    } else if (slide.type === 'conclusion') {
      slide.actions.forEach((act) => {
        content += `✓ ${act}\n`;
      });
      content += `\nContact: ${slide.contact}\n`;
    } else if (slide.type === 'cover') {
      content += `Meta: ${slide.meta}\nNote: ${slide.footerNote}\n`;
    }
    content += `\n------------------------------------------------------------\n\n`;
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
