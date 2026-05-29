import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/build-a-expense-tracker-app-with-a-react-frontend-and-a-fastapi-backend-the-backend-should-have-rest/",
  build: { outDir: "dist", assetsDir: "assets" },
  server: { port: 3000 },
});
