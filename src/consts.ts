import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Chase Johnson",
  EMAIL: "me@chasej.dev",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "About me",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A few thoughts.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where I have worked.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "A collection of my projects, with links to repositories and demos.",
};

export const SOCIALS: Socials = [
  { 
    NAME: "github",
    HREF: "https://github.com/cjohnson19"
  },
  { 
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/chase-johnson19",
  }
];
