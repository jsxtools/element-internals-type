import { mkdir, rm } from "node:fs/promises"
import { $, Glob } from "bun"

await rm("dist", { force: true, recursive: true })
await mkdir("dist", { recursive: true })

const { outputs } = await Bun.build({
	entrypoints: await Array.fromAsync(new Glob("src/**/*.ts").scan()),
	format: "esm",
	minify: {
		identifiers: false,
		syntax: true,
		whitespace: true,
	},
	outdir: "dist",
	root: "src",
	sourcemap: "none",
	splitting: true,
	target: "browser",
	naming: "[dir]/[name].[ext]",
	external: ["react", "react-dom", "vitest"],
})

// optimize outputs
for (const output of outputs) {
	if (output.kind === "chunk") {
		await rm(output.path, { force: true })

		continue
	}

	const file = Bun.file(output.path)
	const originalCode = await file.text()

	const modifiedCode = originalCode
		// remove preloading imports
		.replace(/import\s*"[^"]+";?/g, "")
		// remove bun esm imports
		.replace(/import\{__require,__toESM\}from"[^"]+";/g, "")
		// remove space from import syntax
		.replace(/\}\s+from"/g, '}from"')
		// remove minified exports
		.replace(/(?<=export\s*\{[^}]+\})[\W\w]+$/, "")

	if (originalCode !== modifiedCode) {
		await Bun.write(file, modifiedCode)
	}
}

// copy demo files
for (const demo of await Array.fromAsync(new Glob("demo/**").scan())) {
	const file = Bun.file(demo)
	const path = file.name!.replace(/^demo/, "dist")

	console.log("write", path)
	await Bun.write(path, file)
}

await $`tsc --project tsconfig.json`
