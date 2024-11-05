import { defineConfig } from "astro/config";
import fs from "fs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import aws from "astro-sst";


const plugins = {
  rehypePlugins: [rehypeKatex],
  remarkPlugins: [remarkMath],
};

const adelfaGrammar = JSON.parse(
  fs.readFileSync("./syntaxes/adelfa.tmLanguage.json", "utf-8"),
);

const lfGrammar = JSON.parse(
  fs.readFileSync("./syntaxes/lf.tmLanguage.json", "utf-8"),
);

export default defineConfig({
  output: "static",
  adapter: aws(),
  site: "https://chasej.dev",
  markdown: {
    ...plugins,
    shikiConfig: {
      langs: [
        { name: "adelfa", ...adelfaGrammar },
        { name: "lf", ...lfGrammar },
      ],
    },
  },
  integrations: [mdx(plugins), sitemap(), tailwind()],
});
