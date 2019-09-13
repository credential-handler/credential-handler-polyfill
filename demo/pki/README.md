Create certificates similar to the instructions in:
https://letsencrypt.org/docs/certificates-for-localhost/

```
openssl req \
  -newkey rsa:2048 \
  -x509 \
  -nodes \
  -sha256 \
  -out bedrock.localhost.crt \
  -keyout bedrock.localhost.key \
  -days 10000 \
  -subj '/CN=bedrock.localhost' \
  -reqexts SAN \
  -extensions SAN \
  -config <(cat /etc/ssl/openssl.cnf \
    <(printf '[SAN]\nsubjectAltName=DNS:bedrock.localhost')) \
```
