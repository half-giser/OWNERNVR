/*
 * @Author: xujp xujp@tvt.net.cn
 * @Date: 2023-05-23 17:57:48
 * @Description: 加解密相关方法
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-22 09:00:51
 */

// import MD5 from 'js-md5' // md5加密
import CryptoJS from 'crypto-js' // AES加解密
import JSEncrypt from 'jsencrypt' // RSA加解密
import { encode as _base64Encode, decode as _base64Decode } from 'js-base64'

/**
 * MD5加密
 * @param {MD5.message} word 明文
 */
// export const MD5_encrypt = (word: MD5.message) => {
//     return MD5(word).toUpperCase()
// }

/**
 * MD5加密
 * @param {CryptoJS.lib.WordArray | string} word 明文
 */
export const MD5_encrypt = (word: CryptoJS.lib.WordArray | string) => {
    return CryptoJS.MD5(word).toString().toUpperCase()
}

/**
 * AES加密
 * @param {string} word 明文
 * @param {string} key 秘钥
 * mode和padding 需要与服务端相对应
 */
export const AES_encrypt = (word: string, key: string, blockSizeByte?: number) => {
    // p2p环境下doLogin协议无sesionKey返回，p2p透传协议本身已经加密了，密码不加密明文传输
    if (!key) {
        return word
    }
    const options = {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.ZeroPadding,
        blockSizeByte: 16,
    }
    if (blockSizeByte) {
        options['blockSizeByte'] = blockSizeByte
    }
    const aesKey = CryptoJS.enc.Utf8.parse(key)
    const encrypted = CryptoJS.AES.encrypt(word, aesKey, options)
    return encrypted.toString()
}

/**
 * AES解密
 * @param {string} word 密文
 * @param {string} key 秘钥
 * mode和padding 需要与服务端相对应
 */
export const AES_decrypt = (word: string, key: string) => {
    const aesKey = CryptoJS.enc.Utf8.parse(key)
    const decrypt = CryptoJS.AES.decrypt(word, aesKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.ZeroPadding,
        blockSizeByte: 16,
    })
    const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
    return decryptedStr.toString()
}

/**
 * sha256加密
 * @param {string} word 密文
 */
export const sha256_encrypt = (word: string) => {
    return CryptoJS.SHA256(word)
}

/**
 * sha512加密
 * @param {string} word 密文
 */
export const sha512_encrypt = (word: string) => {
    return CryptoJS.SHA512(word)
}

/**
 * RSA加密
 * @param {string} pubkey 公钥
 * @param {string} plaintext 明文
 */
export const RSA_encrypt = (pubkey: string, plaintext: string) => {
    const encrypt = new JSEncrypt()
    encrypt.setPublicKey(pubkey)
    return encrypt.encrypt(plaintext)
}

/**
 * RSA解密
 * @param {string} privateKey 秘钥
 * @param {string} ciphertext 密文
 */
export const RSA_decrypt = (privateKey: string, ciphertext: string) => {
    const decrypt = new JSEncrypt()
    decrypt.setPrivateKey(privateKey)
    return decrypt.decrypt(ciphertext)
}

/**
 * 异或加密
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
 * 异或解密
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
 * 二进制字符串 => Unicode字符串
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
 * 获取随机数
 */
export const getNonce = () => {
    return Math.floor(Math.random() * 2147483646 + 1)
}

/**
 * Base64加密
 * @param str
 */
export const base64Encode = (str: string) => {
    return _base64Encode(str, true)
}

/**
 * Base64解密
 * @param str
 */
export const base64Decode = (str: string) => {
    return _base64Decode(str)
}
