# --- jesus-germade-es

install:
	npm install || true

live: install
	@node make live

dev: install
	@node make dev

build: install
	@node make build

deploy: build
	# $(shell npm bin)/gh-pages -d public
	git add public -f
	git fetch origin
	-git commit -m "updating public"
	# -git push origin `git subtree split --prefix public master`:gh-pages --force
	git subtree push --prefix public origin gh-pages
	git reset --soft HEAD~1
	git reset HEAD


# DEFAULT TASKS

.DEFAULT_GOAL := build
