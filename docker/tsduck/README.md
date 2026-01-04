# Building the TSDuck Docker Image

This folder contains the files needed to create a Docker image from your local TSDuck installation.

## Prerequisites

- TSDuck installed on the local VM (in `/usr/bin/tsp`)

- Docker installed

## Building the image

Run the build script:

```bash
cd /home/ansible/dvb-probe/docker/tsduck
./build.sh
```

The script will:

1. Check that `/usr/bin/tsp` exists
2. Copy the TSDuck binary to a temporary directory
3. Build the Docker image `dvb-probe-tsduck:local`
4. Clean up temporary files

## Use

Once the image is built, the `docker-compose.yml` file is already configured to use it.

To rebuild the image after a TSDuck update:

```bash
cd /home/ansible/dvb-probe/docker/tsduck
./build.sh
sudo docker compose -f ../docker-compose.yml up -d tsduck
```

## Verification

To verify that TSDuck is working in the container:

```bash
sudo docker exec -it dvb-probe-tsduck tsp --version
```

## Alternative: Direct Binary Mounting

If you prefer to mount the binary directly from the VM (without creating an image), you can modify `docker-compose.yml`:

```yaml
  tsduck:
    image: alpine:latest
    container_name: dvb-probe-tsduck
    volumes:
      - /usr/bin/tsp:/usr/bin/tsp:ro
    command: /bin/sh -c "apk add --no-cache libc6-compat && while true; do sleep 3600; done"
    restart: unless-stopped
```

This approach avoids creating an image but requires that the binary be compatible with the container architecture.
