#!/bin/bash
cd rythm-price-micro-serv
./build.sh

cd ..

cd rythm-micro-serv-cdk
npm install
npm run build
cdk synth "*"
cdk deploy "*"