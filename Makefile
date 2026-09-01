.PHONY: bundle build-debian test clean publish install

bundle:
	pnpx esbuild src/cli.js --bundle --platform=node --outfile=dist/bundle.js

build-debian: bundle
	dpkg-buildpackage -us -uc -b
	mkdir -p dist
	mv ../ocm_*.deb dist/

test: build-debian
	docker build -t ocm-test -f Dockerfile.test .
	docker run --rm ocm-test && $(MAKE) clean || ($(MAKE) clean; exit 1)

install:
	install -D -m 755 bin/ocm $(DESTDIR)/usr/bin/ocm
	install -D -m 644 dist/bundle.js $(DESTDIR)/usr/lib/ocm/bundle.js
	install -D -m 644 completions/ocm $(DESTDIR)/usr/share/bash-completion/completions/ocm

clean:
	rm -rf dist/
	rm -f ../ocm_*.buildinfo ../ocm_*.changes

publish:
	bash ./scripts/publish.sh
