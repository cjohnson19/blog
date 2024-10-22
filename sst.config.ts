/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "blog",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    new sst.aws.Astro("Blog", {
      domain:
        $app.stage === "production"
          ? {
              name: "chasej.dev",
              redirects: ["www.chasej.dev"],
            }
          : undefined,
    });
  },
  console: {
    autodeploy: {
      target(event) {
        // Use the `main` branch as the trigger for production deployment.
        if (
          event.type === "branch" &&
          event.branch === "main" &&
          event.action === "pushed"
        ) {
          return {
            stage: "production",
          };
        }
        if (event.type === "pull_request") {
          return {
            stage: `pr-${event.number}`,
          };
        }
      },
    },
  },
});
