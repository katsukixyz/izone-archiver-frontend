module.exports = {
  redirects() {
    return [
      process.env.MAINTENANCE_MODE === "1"
        ? {
            source: "/((?!maintenance).*)",
            destination: "/maintenance.html",
            permanent: false,
          }
        : null,
    ].filter(Boolean);
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        test: /\.(js|ts)x?$/,
      },
      use: ["@svgr/webpack"],
    });

    return config;
  },
};
