.PHONY: bundle build-debian clean

bundle:
	pnpx esbuild src/cli.js --bundle --platform=node --outfile=dist/bundle.js

build-debian: bundle
	dpkg-buildpackage -us -uc -b
	mkdir -p dist
	mv ../ocm_*.deb dist/

clean:
	rm -rf dist/
	rm -f ../ocm_*.buildinfo ../ocm_*.changes
