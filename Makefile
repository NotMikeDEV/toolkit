default:
build:
	docker compose build
start: build stop
	docker compose up -d
stop:
	docker compose down --remove-orphans
dev: start
	docker compose logs -f &
	docker compose watch
clean:
	docker compose down -v --remove-orphans
	docker image rm docker.notmike.net/toolkit/server;true
	docker system prune -f