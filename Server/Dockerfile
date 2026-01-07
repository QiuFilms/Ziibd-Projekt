FROM container-registry.oracle.com/os/oraclelinux:8-slim

# Install Oracle Linux 8 release packages
RUN microdnf install -y oraclelinux-release-el8 oracle-release-el8 && \
    # Enable Node.js 18 module
    microdnf module enable -y nodejs:18 && \
    # Install Node.js, Instant Client 19, and libaio
    microdnf install -y nodejs \
                       oracle-instantclient19.25-basic \
                       libaio && \
    microdnf clean all

WORKDIR /app

# Install dependencies separately to leverage Docker caching
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Environment variables updated for version 19
# Note: Oracle 19c paths usually use /usr/lib/oracle/19/client64/lib
ENV LD_LIBRARY_PATH=/usr/lib/oracle/19/client64/lib
ENV PATH=$PATH:/usr/lib/oracle/19/client64/bin



CMD ["node", "index.js"]