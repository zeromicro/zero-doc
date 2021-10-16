#!/bin/bash
ACCESSTOKEN=$1
REPO="https://x-access-token:${ACCESSTOKEN}@github.com/zeromicro/go-zero-pages.git"

# git 配置
echo "git基础配置"
git config --global user.name "anqiansong"
git config --global user.email "anqiansong@tal.com"

# push
cd ./go-zero.dev
mkdir ./doc
cd ./doc
echo $PWD
echo "document clone..."
git clone ${REPO}
cd go-zero-pages
rm -rf ./*
cp -rf ../../_book/* .
git add ./*
git commit -m 'update document'
echo "document push..."
git push -f