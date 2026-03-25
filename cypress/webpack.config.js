/**
 * @fileoverview Webpack Configuration for Cypress
 *
 * Enables path aliases so imports stay clean:
 *   @configs/*  → cypress/configs/*
 *   @support/*  → cypress/support/*
 *   @schemas/*  → cypress/schemas/*
 *   @core/*     → cypress/support/core/*
 */
const path = require("node:path");

module.exports = {
  resolve: {
    alias: {
      "@configs": path.resolve(__dirname, "configs"),
      "@support": path.resolve(__dirname, "support"),
      "@tests": path.resolve(__dirname, "tests"),
      "@fixtures": path.resolve(__dirname, "fixtures"),
      "@schemas": path.resolve(__dirname, "schemas"),
      "@core": path.resolve(__dirname, "support/core"),
    },
    extensions: [".js", ".jsx", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: { presets: ["@babel/preset-env"] },
        },
      },
      {
        test: /\.m?js/,
        resolve: { fullySpecified: false },
      },
    ],
  },
};
