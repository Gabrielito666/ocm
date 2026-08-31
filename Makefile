.PHONY: bundle build-debian test clean

bundle:
	pnpx esbuild src/cli.js --bundle --platform=node --outfile=dist/bundle.js

build-debian: bundle
	dpkg-buildpackage -us -uc -b
	mkdir -p dist
	mv ../ocm_*.deb dist/

test: build-debian
	docker build -t ocm-test -f Dockerfile.test .
	docker run --rm ocm-test && $(MAKE) clean || ($(MAKE) clean; exit 1)

clean:
	rm -rf dist/
	rm -f ../ocm_*.buildinfo ../ocm_*.changes
