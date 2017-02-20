.PHONY: build run stop exec logs buildnocache

buildnocache:
	docker build --no-cache -t demo .
build:
	docker build  -t demo .
run:
	docker-compose up -d
stop:
	docker-compose down
exec:
	docker exec -it demo_demo_1 sh
logs:
	docker-compose logs -f
