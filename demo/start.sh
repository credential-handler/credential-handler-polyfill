#!/bin/bash

npx http-server -p 22443 -S -C ./pki/cert.pem -K ./pki/key.pem
