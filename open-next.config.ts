// open-next.config.ts — Cloudflare deployment config for OpenNext
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
	// For best results consider enabling R2 caching
	// See https://opennext.js.org/cloudflare/caching for more details
	// Note: incrementalCache requires R2 bucket setup — see wrangler.toml
});
