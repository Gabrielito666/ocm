.PHONY: bundle

bundle:
	pnpx esbuild src/cli.js --bundle --platform=node --outfile=dist/bundle.js
