import { createFileRoute } from "@tanstack/react-router";
import { GenerateWorkspace } from "@/components/GenerateWorkspace";

export const Route = createFileRoute("/generate-image")({
  head: () => ({
    meta: [
      { title: "Generate Ad Image — ADbee AI" },
      {
        name: "description",
        content:
          "Generate stunning AI-powered ad images from a single product photo with ADbee AI.",
      },
      { property: "og:title", content: "Generate Ad Image — ADbee AI" },
      {
        property: "og:description",
        content: "Upload a product photo and create scroll-stopping ad images in seconds.",
      },
    ],
  }),
  component: () => <GenerateWorkspace mode="image" />,
});
