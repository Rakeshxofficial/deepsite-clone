FROM node:20-alpine
USER root

USER 1000
WORKDIR /usr/src/app

# Copy package files
COPY --chown=1000 package.json package-lock.json ./

# Copy the rest of the application files
COPY --chown=1000 . .

# Install dependencies
RUN npm install

# Build the application
RUN NODE_OPTIONS=--max-old-space-size=4096 npm run build

# Copy static assets and public files to standalone build
RUN cp -r public .next/standalone/
RUN cp -r .next/static .next/standalone/.next/

# Expose the application port
EXPOSE 10000

# Start the application using the standalone server
CMD ["node", ".next/standalone/server.js"]