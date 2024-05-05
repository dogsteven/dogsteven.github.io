import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    mdx(),
    icon({
      svgoOptions: {
        plugins: [
          "preset-default",
          {
            name: "convertColors",
            params: { currentColor: true },
          },
        ],
      },
    })
  ],
  site: "https://dogsteven.github.io",

  markdown: {
    remarkPlugins: [
      remarkMath
    ],
    rehypePlugins: [
      [rehypeKatex, {}],
    ]
  }
});
