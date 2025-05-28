#!/bin/bash
# 参数1：布局和风格,eg UI1-A | UI2-B | UI1-P
# 参数2：客户编码。 可为空表示中性，eg IL03 | USW90

export UI_STR=$1
export PKGID=$2


echo "UI_STR=$UI_STR , PKGID=$PKGID"

## 用新的判断WORK目录的方法，需要用 /bin/bash，不能用 /bin/sh
CurWorkDir=$(pwd)
[ ${0:0:1} = / ] && WORK=${0%/*} || WORK=$PWD/${0%/*}
#echo work dir is: $WORK
# $WORK 是 本脚本所在的目录

PKGID_Suffix=
if [ -n "$PKGID" ] ; then
  PKGID_Suffix="_$PKGID"  
fi

cd $WORK
rm -rf dist
# npm run mirror:set
npm install
#npm run generate bundle=UI1-A,UI2-A_IL03,UI1-E_USE44
npm run generate bundle=${UI_STR}${PKGID_Suffix}
#清除临时文件
npm run clean level=runtime
if [ ! -d dist ] ; then
  echo "build Web fail! Need Node 20.13.0+, npm 10.5.0+ at least!"
  exit 1  
fi

exit 0
