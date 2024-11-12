/*
 * @Author: xujp xujp@tvt.net.cn
 * @Date: 2023-05-23 17:57:48
 * @Description: 加解密相关方法
 */

import { encode as Base64Encode, decode as Base64Decode } from 'js-base64'
import 'crypto-js/enc-base64'
import MD5 from 'crypto-js/md5'
import WordArray from 'crypto-js/lib-typedarrays'
import SHA256 from 'crypto-js/sha256'
import SHA512 from 'crypto-js/sha512'
import ZeroPadding from 'crypto-js/pad-zeropadding'
import ECB from 'crypto-js/mode-ecb'
import UTF8 from 'crypto-js/enc-utf8'
import AES from 'crypto-js/aes'
import RSA from 'jsencrypt'
// import MD5 from 'js-md5'

/**
 * MD5加密
 * @param {MD5.message} word 明文
 */
// export const MD5_encrypt = (word: MD5.message) => {
//     return MD5(word).toUpperCase()
// }

/**
 * @description MD5加密
 * @param {ArrayBuffer | string} word 明文
 */
export const MD5_encrypt = (word: ArrayBuffer | string) => {
    if (word instanceof ArrayBuffer) {
        return MD5(WordArray.create(word)).toString().toUpperCase()
    }
    return MD5(word).toString().toUpperCase()
}

/**
 * @description AES加密 (mode和padding 需要与服务端相对应)
 * @param {string} word 明文
 * @param {string} key 秘钥
 * @param {number} blockSizeByte
 */
export const AES_encrypt = (word: string, key: string, blockSizeByte?: number) => {
    // p2p环境下doLogin协议无sesionKey返回，p2p透传协议本身已经加密了，密码不加密明文传输
    if (!key) {
        return word
    }
    const options = {
        mode: ECB,
        padding: ZeroPadding,
        blockSizeByte: blockSizeByte ? blockSizeByte : 16,
    }
    const aesKey = UTF8.parse(key)
    const encrypted = AES.encrypt(word, aesKey, options)
    return encrypted.toString()
}

/**
 * @description AES解密 (mode和padding 需要与服务端相对应)
 * @param {string} word 密文
 * @param {string} key 秘钥
 * @param {number} blockSizeByte
 */
export const AES_decrypt = (word: string, key: string) => {
    const aesKey = UTF8.parse(key)
    const decrypt = AES.decrypt(word, aesKey, {
        mode: ECB,
        padding: ZeroPadding,
        blockSizeByte: 16,
    })
    const decryptedStr = decrypt.toString(UTF8)
    return decryptedStr.toString()
}

/**
 * @description sha256加密
 * @param {string} word 密文
 */
export const sha256_encrypt = (word: string) => {
    return SHA256(word).toString()
}

/**
 * @description sha512加密
 * @param {string} word 密文
 */
export const sha512_encrypt = (word: string) => {
    return SHA512(word).toString()
}

/**
 * @description RSA加密
 * @param {string} pubkey 公钥
 * @param {string} plaintext 明文
 */
export const RSA_encrypt = (pubkey: string, plaintext: string) => {
    const encrypt = new RSA()
    encrypt.setPublicKey(pubkey)
    return encrypt.encrypt(plaintext)
}

/**
 * @description RSA解密
 * @param {string} privateKey 秘钥
 * @param {string} ciphertext 密文
 */
export const RSA_decrypt = (privateKey: string, ciphertext: string) => {
    const decrypt = new RSA()
    decrypt.setPrivateKey(privateKey)
    return decrypt.decrypt(ciphertext)
}

/**
 * @description 异或加密
 * @param {string} md5 md5密码
 * @param {number} nonce 随机数
 */
export const XOREncrypt = (md5: string, nonce: number) => {
    const list = []
    for (let i = 0; i < md5.length; i++) {
        const intNum = (md5[i] as any).charCodeAt().toString(2) ^ nonce
        list.push(intNum)
    }
    return list.join(' ')
}

/**
 * @description 异或解密
 * @param {string} word 密文
 * @param {number} nonce 随机数
 */
export const XORDecrypt = (word: string, nonce: number) => {
    const list: string[] = word.split(' ')
    let str = ''
    for (let i = 0; i < list.length; i++) {
        const intStr = ((list[i] as any) ^ nonce) + ''
        str += binaryToStr(intStr)
    }
    return str
}

/**
 * @description 二进制字符串 => Unicode字符串
 * @param {string} str 二进制字符串
 */
export const binaryToStr = (str: string) => {
    const result = []
    const list = str.split(' ')
    for (let i = 0; i < list.length; i++) {
        const item = list[i]
        const asciiCode = parseInt(item, 2)
        const charValue = String.fromCharCode(asciiCode)
        result.push(charValue)
    }
    return result.join('')
}

/**
 * @description 获取随机数
 */
export const getNonce = () => {
    return Math.floor(Math.random() * 2147483646 + 1)
}

/**
 * @description Base64加密
 * @param {string} str
 */
export const base64Encode = (str: string) => {
    return Base64Encode(str, true)
}

/**
 * @description Base64解密
 * @param {string} str
 */
export const base64Decode = (str: string) => {
    return Base64Decode(str)
}
