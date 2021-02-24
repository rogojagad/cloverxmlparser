FROM node:12

# Setup Workdir
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install Vue CLI
RUN npm install -g @vue/cli

# Copy App Source Code
COPY . .

# Install Dependency
RUN npm install

# Expose Ports
EXPOSE 3030

# Run Dev Server
CMD ["npm", "run", "serve"]