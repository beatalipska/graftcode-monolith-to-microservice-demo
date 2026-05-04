FROM node:24

WORKDIR /usr/app

COPY ./app-service /usr/app/
COPY ./app/src /usr/app/app-src/

RUN apt-get update \
 && apt-get install -y wget \
 && case "amd64" in \
      "arm64") GG_ARCH="arm64" ;; \
      "amd64") GG_ARCH="amd64" ;; \
      *) echo "Unsupported architecture: amd64" && exit 1 ;; \
    esac \
 && wget -O /usr/app/gg.deb "https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_${GG_ARCH}.deb" \
 && dpkg -i /usr/app/gg.deb \
 && rm /usr/app/gg.deb \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "./package.json"]
