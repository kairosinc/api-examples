.PHONY: build run stop

build:
	docker build --no-cache -t demo .
run:
	docker-compose up -d
stop:
	docker-compose down

