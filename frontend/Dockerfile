FROM nginx:1.25

# SSL certs
RUN mkdir /etc/nginx/ssl
RUN openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
   -out /etc/nginx/ssl/cert.crt \
   -keyout /etc/nginx/ssl/cert.key \
   -subj "/C=TR/ST=Istanbul/L=Istanbul/O=42 School/OU=ykimirti/CN=ykimirti/"

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

COPY ./static /static
