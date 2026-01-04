FROM alpine:latest

# Install minimal dependencies that TSDuck might need
# Note: TSDuck binary must be compatible with Alpine (musl libc)
# If your TSDuck was built for glibc (Debian/Ubuntu), consider using debian:stable-slim instead
RUN apk add --no-cache \
    libstdc++ \
    gcompat \
    && rm -rf /var/cache/apk/*

# Create directories for TSDuck
RUN mkdir -p /usr/bin /usr/share/tsduck

# Copy TSDuck binary from host (will be copied during build)
# The binary should be copied from the build context
COPY tsp /usr/bin/tsp

# Make it executable
RUN chmod +x /usr/bin/tsp

# Copy TSDuck configuration files (if tsduck_share directory exists)
# This includes tsduck.hfbands.xml and other configuration files
COPY tsduck_share/ /usr/share/tsduck/

# Verify TSDuck is available
RUN /usr/bin/tsp --version || echo "TSDuck binary copied, but version check failed"

# Keep container running
CMD ["/bin/sh", "-c", "while true; do sleep 3600; done"]

