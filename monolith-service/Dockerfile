FROM node:24

WORKDIR /usr/app

COPY ./monolith-service /usr/app/
COPY ./app/src/seed-products.js /usr/app/app-src/seed-products.js
COPY ./app/src/catalog.js /usr/app/app-src/catalog.js
COPY ./app/src/pricing.js /usr/app/app-src/pricing.js
COPY ./app/src/orders.js /usr/app/app-src/orders.js

ARG TARGETARCH

RUN apt-get update \
 && apt-get install -y wget \
 && case "${TARGETARCH}" in \
      "arm64") GG_ARCH="arm64" ;; \
      "amd64") GG_ARCH="amd64" ;; \
      *) echo "Unsupported architecture: ${TARGETARCH}" && exit 1 ;; \
    esac \
 && wget -O /usr/app/gg.deb "https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_${GG_ARCH}.deb" \
 && dpkg -i /usr/app/gg.deb \
 && rm /usr/app/gg.deb \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 18080
EXPOSE 18081

CMD ["gg", "./package.json", "--httpPort", "18081", "--port", "18080"]
