// Navigation data types
export type NavItem = {
  title: string;
  href?: string;
  isOpen?: boolean;
  sections?: NavSection[];
}

export type NavSection = {
  title: string;
  animatedEndings?: string[];
  items: {
    title: string;
    description?: string;
    href: string;
    icon?: string;
  }[];
}

// Application-specific navigation items
export const navItems: NavItem[] = [
  {
    title: "Features",
    sections: [
      {
        title: "FEATURES THAT HELP YOU ", // The ending will be animated
        animatedEndings: ["UNDERSTAND", "COLLABORATE", "RESEARCH"],
        items: [
          {
            title: "Dynamic questions",
            description: "Questions that adapt to your users in real time using AI. Follow-up questions have never been more powerful.",
            href: "/features/dynamic-responses",
            icon: "overview"
          },
          {
            title: "Templates",
            description: "Out of the box templates to help you get up and going at the speed of thought.",
            href: "/features/templates",
            icon: "ai"
          },
          {
            title: "Form builder",
            description: "Create custom forms to collect data and insights from your users.",
            href: "/features/form-builder",
            icon: "form"
          },
          {
            title: "Powerful branching",
            description: "Branching logic that allows you to control the flow of your form with utmost precision.",
            href: "/features/survey-maker",
            icon: "survey"
          },
          {
            title: "Integrations",
            description: "Find the apps your team is already using or discover new ways to get work done with FlowForm.",
            href: "/features/integrations",
            icon: "quiz"
          },
          {
            title: "Analytics",
            description: "Track and analyze the performance of your forms and surveys with powerful features all on one platform.",
            href: "/features/analytics",
            icon: "test"
          },
        ],
      },
      {
        title: "WORKFLOWS",
        items: [
          {
            title: "Free form, survey, and quiz templates",
            href: "/templates",
          },
        ],
      }
    ],
  },
  {
    title: "Solutions",
    sections: [
      {
        title: "SOLUTIONS THAT HELP YOU ", // The ending will be animated
        animatedEndings: ["SUCCEED", "INNOVATE", "TRANSFORM"],
        items: [
          {
            title: "Enterprise solutions",
            description: "Secure, scalable solutions for organizations with complex needs.",
            href: "/solutions/enterprise",
            icon: "overview"
          },
          {
            title: "Collaboration features",
            description: "Work together with your team to build the perfect form experience.",
            href: "/solutions/collaboration",
            icon: "ai"
          },
          {
            title: "Advanced security",
            description: "Enterprise-grade security features to protect your data and users.",
            href: "/solutions/security",
            icon: "form"
          },
          {
            title: "API access",
            description: "Build custom integrations and workflows with our powerful API.",
            href: "/solutions/api",
            icon: "survey"
          },
          {
            title: "Scalable infrastructure",
            description: "Our platform grows with your needs, from startups to enterprise.",
            href: "/solutions/infrastructure",
            icon: "quiz"
          },
          {
            title: "Compliance & privacy",
            description: "GDPR, HIPAA, and SOC2 compliant solutions for regulated industries.",
            href: "/solutions/compliance",
            icon: "test"
          },
        ],
      },
      {
        title: "WORKFLOWS",
        items: [
          {
            title: "Integrations",
            href: "/solutions/integrations",
          },
          {
            title: "Apps that integrate with FlowForm",
            href: "/solutions/integrations",
          },
          {
            title: "See all integrations",
            href: "/solutions/all-integrations",
          }
        ],
      }
    ],
  },
  {
    title: "Resources",
    sections: [
      {
        title: "LEARN",
        items: [
          {
            title: "Blog",
            href: "/resources/blog",
          },
          {
            title: "Help Center",
            href: "/resources/help",
          },
          {
            title: "Guides",
            href: "/resources/guides",
          },
        ],
      },
      {
        title: "COMPANY",
        items: [
          {
            title: "Partner with us",
            href: "/company/partners",
          },
          {
            title: "Careers",
            href: "/company/careers",
          },
          {
            title: "Contact us",
            href: "/company/contact",
          },
        ],
      },
      {
        title: "NEWS",
        items: [
          {
            title: "FlowForm for Growth",
            description: "For B2B marketers",
            href: "/news/growth",
          },
          {
            title: "Product updates",
            description: "Last feature releases",
            href: "/news/updates",
          },
          {
            title: "Hubspot for FlowForm",
            description: "Our new partner",
            href: "/news/hubspot",
          },
          {
            title: "Sales and marketing misalignment",
            description: "Check out our latest ebook",
            href: "/news/sales-marketing",
          },
        ],
      },
    ],
  },
  {
    title: "Pricing",
    href: "/pricing",
  },
];
