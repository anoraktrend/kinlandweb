import { requestWithMetadata } from "@tinacms/astro/data";
import client from "../../../tina/__generated__/client";

export const getPost = (relativePath: string) =>
  requestWithMetadata(
    client.queries.post({ relativePath }),
    { priority: "primary" }
  );
