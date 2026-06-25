import type { IslandRegistry } from "@tinacms/astro/experimental";
import type { QueryResult } from "@tinacms/astro/data";
import PostBody from "../../components/tina/PostBody.astro";
import { getPost } from "./data";

export const islands: IslandRegistry = {
  post: {
    fetch: (_request, params) =>
      getPost(params.get("slug") ?? ""),
    component: PostBody,
    wrapper: { tag: "article" },
    propsFromData: (data) => ({
      data: (data as QueryResult<any>).data?.post,
    }),
  },
};
