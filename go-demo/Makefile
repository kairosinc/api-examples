#
#  Makefile for Go
#

export PATH := /usr/local/go/bin:$(PATH)
export GOPATH := $(shell pwd)

GO_CMD=go
GO_BUILD=$(GO_CMD) build
GO_BUILD_RACE=$(GO_CMD) build -race
GO_TEST=$(GO_CMD) test
GO_TEST_VERBOSE=$(GO_CMD) test -v
GO_INSTALL=$(GO_CMD) install -v
GO_CLEAN=$(GO_CMD) clean
GO_DEPS=$(GO_CMD) get -d -v
GO_DEPS_TEST=$(GO_CMD) get -d -v -t
GO_DEPS_UPDATE=$(GO_CMD) get -d -v -u
GO_VET=$(GO_CMD) vet
GO_FMT=$(GO_CMD) fmt
GO_LINT=golint
APP_NAME=go-demo

GOOS=linux
GOARCH=amd64

ifeq ($(OS),Windows_NT)
    detected_OS := Windows
else
    detected_OS := $(shell sh -c 'uname -s 2>/dev/null || echo not')
endif


# Packages
TOP_PACKAGE_DIR := .
PACKAGE_LIST := src/app/./...

.PHONY: all build build-race build-linux proto test test-verbose deps deps-test update-deps install install-linux clean fmt vet lint docker run logs

all: build

build: clean deps proto vet
	@for p in $(PACKAGE_LIST); do \
		echo "==> Build $$p ..."; \
		if [ "$(detected_OS)" = "Linux" ] ; then \
			cp bin/protoc-gen-go /usr/bin/ ; \
			GOOS=$(GOOS) GOARCH=$(GOARCH) $(GO_BUILD) $(TOP_PACKAGE_DIR)/$$p || exit 1; \
		else  \
			$(GO_BUILD) $(TOP_PACKAGE_DIR)/$$p || exit 1; \
		fi \
	done

build-linux: clean deps proto vet
	@for p in $(PACKAGE_LIST); do \
		echo "==> Build $$p ..."; \
		GOOS=$(GOOS) GOARCH=$(GOARCH) $(GO_BUILD) $(TOP_PACKAGE_DIR)/$$p || exit 1; \
	done

build-race: deps proto vet
	@for p in $(PACKAGE_LIST); do \
		echo "==> Build $$p ..."; \
		$(GO_BUILD_RACE) $(TOP_PACKAGE_DIR)/$$p || exit 1; \
	done

proto:
	# use $$dir as the root for all proto files in the same directory
	@for dir in $$(git ls-files '*.proto' | xargs -n1 dirname | uniq); do \
		protoc -I $$dir --go_out=plugins=grpc:$$dir $$dir/*.proto; \
	done

test: deps-test
	@for p in $(PACKAGE_LIST); do \
		echo "==> Unit Testing $$p ..."; \
		$(GO_TEST) $(TOP_PACKAGE_DIR)/$$p || exit 1; \
	done

test-verbose: deps-test
	@for p in $(PACKAGE_LIST); do \
		echo "==> Unit Testing $$p ..."; \
		$(GO_TEST_VERBOSE) $(TOP_PACKAGE_DIR)/$$p || exit 1; \
	done

deps:
	go get -u github.com/golang/protobuf/proto
	go get -u github.com/golang/protobuf/protoc-gen-go
	go get -d -v google.golang.org/grpc/...
	@if [ "$(detected_OS)" = "Linux" ]; then \
		cp bin/protoc-gen-go /usr/bin/ ; \
	fi
	@for p in $(PACKAGE_LIST); do \
		echo "==> Install dependencies for $$p ..."; \
		$(GO_DEPS) $(TOP_PACKAGE_DIR)/$$p || exit 1; \
	done

deps-test:
	go get -u github.com/golang/protobuf/proto
	go get -u github.com/golang/protobuf/protoc-gen-go
	go get -d -v -t google.golang.org/grpc/...
	@if [ "$(detected_OS)" = "Linux" ]; then \
		cp bin/protoc-gen-go /usr/bin/ ; \
	fi
	@for p in $(PACKAGE_LIST); do \
		echo "==> Install dependencies for $$p ..."; \
		$(GO_DEPS_TEST) $(TOP_PACKAGE_DIR)/$$p || exit 1; \
	done

update-deps:
	go get -u github.com/golang/protobuf/{proto,protoc-gen-go}
	go get -d -v -u -f google.golang.org/grpc/...
	@for p in $(PACKAGE_LIST); do \
		echo "==> Update dependencies for $$p ..."; \
		$(GO_DEPS_UPDATE) $(TOP_PACKAGE_DIR)/$$p || exit 1; \
	done

install:
	@for p in $(PACKAGE_LIST); do \
		echo "==> Install $$p ..."; \
		if [ "$(detected_OS)" = "Linux" ] ; then \
			GOOS=$(GOOS) GOARCH=$(GOARCH) $(GO_INSTALL) $(TOP_PACKAGE_DIR)/$$p || exit 1; \
		else \
			$(GO_INSTALL) $(TOP_PACKAGE_DIR)/$$p || exit 1; \
		fi \
	done

install-linux:
	@for p in $(PACKAGE_LIST); do \
		echo "==> Install $$p ..."; \
		GOOS=$(GOOS) GOARCH=$(GOARCH) $(GO_INSTALL) $(TOP_PACKAGE_DIR)/$$p || exit 1; \
	done

clean:
	@for p in $(PACKAGE_LIST); do \
		echo "==> Clean $$p ..."; \
		$(GO_CLEAN) $(TOP_PACKAGE_DIR)/$$p; \
	done
	-rm -rf bin/*

fmt:
	@for p in $(PACKAGE_LIST); do \
		echo "==> Formatting $$p ..."; \
		$(GO_FMT) $(TOP_PACKAGE_DIR)/$$p || exit 1; \
	done
vet:
	@for p in $(PACKAGE_LIST); do \
		echo "==> Vet $$p ..."; \
		$(GO_VET) $(TOP_PACKAGE_DIR)/$$p; \
	done

lint:
	@for p in $(PACKAGE_LIST); do \
		echo "==> Lint $$p ..."; \
		$(GO_LINT) $(TOP_PACKAGE_DIR)/$$p; \
	done

docker: build-linux install-linux
	docker build -f Dockerfile.linux -t registry.prod.kairos.com/$(APP_NAME):latest .

run:
	docker run -it --rm --name $(APP_NAME) -p 8080:8080 registry.prod.kairos.com/$(APP_NAME):latest .

logs:
	$(shell docker logs -f $(shell docker ps -q))

exec:
	docker exec -it $(APP_NAME) bash

# vim: set noexpandtab shiftwidth=8 softtabstop=0:
