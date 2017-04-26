FROM  registry.zha.ooclit.cn/server/welfare-dom-dependency:latest

MAINTAINER "David JW Lin" David.J.W.Lin@oocl.com

WORKDIR /home/welfare


# Add code
ADD . /home/welfare

# Install packages again to avoid missing
RUN npm install --quiet --config.interactive=false && npm cache clean

# Port 3000 for server
# Port 35729 for livereload
EXPOSE 3000 35729

ENTRYPOINT ["gulp"]
