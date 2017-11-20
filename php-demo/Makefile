.PHONY: build run stop exec logs buildnocache build-dockerhub push-dockerhub

buildnocache:
	docker build --no-cache -t demo .
build:
	docker build  -t demo .
run:
	docker-compose up -d
stop:
	docker-compose down
exec:
	docker exec -it phpdemo_demo_1 sh
logs:
	docker-compose logs -f
build-dockerhub:
	docker build -t kairos/demo .

push-dockerhub:
	docker push kairos/demo
