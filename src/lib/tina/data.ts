import { getEntry, render } from "astro:content";

export const getPost = async (slug: string) => {
  const entry = await getEntry("post", slug);
  if (!entry) return null;

  const { Content } = await render(entry);
  return { ...entry, Content };
};
