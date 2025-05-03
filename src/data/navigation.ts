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
        animatedEndings: ["MARKET", "LEARN", "DESIGN", "RESEARCH"],
        items: [
          {
            title: "Marketing Teams",
            description: "Powerful forms and survey tools for capturing leads and customer insights.",
            href: "/solutions/marketing-teams",
            icon: "megaphone"
          },
          {
            title: "Research Teams",
            description: "Advanced data collection tools for academic and market research.",
            href: "/solutions/research-teams",
            icon: "microscope"
          },
          {
            title: "Design Teams",
            description: "Intuitive user testing and feedback collection for design iteration.",
            href: "/solutions/design-teams",
            icon: "palette"
          },
          {
            title: "Engineering Teams",
            description: "Feature prioritization and technical feedback collection tools.",
            href: "/solutions/engineering-teams",
            icon: "code"
          },
          {
            title: "Startups",
            description: "Cost-effective solutions for early-stage companies validating ideas.",
            href: "/solutions/startups",
            icon: "rocket"
          },
          {
            title: "Enterprise",
            description: "Secure, scalable solutions for organizations with complex needs.",
            href: "/solutions/enterprise",
            icon: "building"
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
