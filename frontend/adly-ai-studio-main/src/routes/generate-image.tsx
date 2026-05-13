import { createFileRoute } from "@tanstack/react-router";
import { GenerateWorkspace } from "@/components/GenerateWorkspace";

export const Route = createFileRoute("/generate-image")({
  head: () => ({
    meta: [
      { title: "Generate Ad Image — ADly AI" },
      {
        name: "description",
        content:
          "Generate stunning AI-powered ad images from a single product photo with ADly AI.",
      },
      { property: "og:title", content: "Generate Ad Image — ADly AI" },
      {
        property: "og:description",
        content: "Upload a product photo and create scroll-stopping ad images in seconds.",
      },
    ],
  }),
  component: () => <GenerateWorkspace mode="image" />,
});
