import { createFileRoute } from "@tanstack/react-router";
import { GenerateWorkspace } from "@/components/GenerateWorkspace";

export const Route = createFileRoute("/generate-video")({
  head: () => ({
    meta: [
      { title: "Generate Ad Video — ADly AI" },
      {
        name: "description",
        content:
          "Create cinematic AI-generated product ad videos from a single image with ADly AI.",
      },
      { property: "og:title", content: "Generate Ad Video — ADly AI" },
      {
        property: "og:description",
        content: "Turn product photos into animated, cinematic ad videos in seconds.",
      },
    ],
  }),
  component: () => <GenerateWorkspace mode="video" />,
});
