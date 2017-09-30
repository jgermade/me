# --- jesus-germade-es

install:
	npm install || true

live: install
	@node make live

dev: install
	@node make dev

build: install
	@node make build

# DEFAULT TASKS

.DEFAULT_GOAL := build
