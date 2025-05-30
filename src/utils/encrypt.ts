/*
 * @Author: xujp xujp@tvt.net.cn
 * @Date: 2023-05-23 17:57:48
 * @Description: 加解密相关方法
 */

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
import { KEYUTIL } from 'jsrsasign'

const rsaKeypair = KEYUTIL.generateKeypair('RSA', 1024)
export const RSA_PUBLIC_KEY = KEYUTIL.getPEM(rsaKeypair.prvKeyObj) //获取公钥
export const RSA_PRIVATE_KEY = KEYUTIL.getPEM(rsaKeypair.prvKeyObj, 'PKCS8PRV') //获取私钥

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

export const MD5_encrypt_WordArray = (word: ArrayBuffer | string) => {
    if (word instanceof ArrayBuffer) {
        return MD5(WordArray.create(word))
    }
    return MD5(word)
}

/**
 * @description AES加密 ECB (mode和padding 需要与服务端相对应)
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
 * @description AES解密 ECB (mode和padding 需要与服务端相对应)
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
 * AESEncrypt CBC mode, Parse plaintext into ciphertext based on the specified key, iv
 * @param {String} plaintext
 * @param {wordArray} aesKey
 * @param {wordArray} aesIv
 * @returns {String} Base64str
 */
export const AES_CBC_Encrypt = (plaintext: string, aesKey: WordArray, aesIv: WordArray) => {
    return AES.encrypt(plaintext, aesKey, { iv: aesIv }).toString()
}

/**
 * AESEncrypt CBC mode, Parse ciphertext into plaintext based on the specified key, iv
 * @param {String} ciphertext
 * @param {wordArray} aesKey
 * @param {wordArray} aesIv
 * @returns  {String}
 */
export const AES_CBC_Decrypt = (ciphertext: string, aesKey: WordArray, aesIv: WordArray) => {
    if (!ciphertext) return ''
    return AES.decrypt(ciphertext, aesKey, {
        iv: aesIv,
        blockSizeByte: 16,
    }).toString(UTF8)
}

// base64转为url地址
// 标准的Base64编码传输url可能会带来问题, 因为它使用了在url中具有特殊意义的字符（加号（+），斜杠（/）和等号（=））
// basr64传输url前, +/=字符应分别被替换为点（.）、下划线（_）和破折号（-）
export const base64StrToUrl = (base64Str: string) => {
    return base64Str.replace(/\+/g, '.').replace(/\//g, '_').replace(/=/g, '-')
}

// url转为base64地址（url中的base64取出值时, 同上进行还原）
export const urlToBase64Str = (url: string) => {
    return url.replace(/\./g, '+').replace(/_/g, '/').replace(/-/g, '=')
}

/**
 * @description sha256加密
 * @param {string} word 密文
 */
export const sha256_encrypt = (word: string) => {
    return SHA256(word).toString()
}

export const sha256_encrypt_WordArray = (word: string) => {
    return SHA256(word)
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
    const u8a = new TextEncoder().encode(str)
    const maxargs = 0x1000
    const strs: string[] = []
    for (let i = 0, l = u8a.length; i < l; i += maxargs) {
        strs.push(String.fromCharCode(...u8a.subarray(i, i + maxargs)))
    }
    return btoa(strs.join(''))
        .replace(/=/g, '')
        .replace(/[+\/]/g, (m0) => {
            return m0 === '+' ? '-' : '_'
        })
}

/**
 * @description Base64解密
 * @param {string} str
 */
export const base64Decode = (str: string) => {
    const text = str.replace(/[-_]/g, (m0) => {
        return m0 === '-' ? '+' : '/'
    })
    const u8a = Uint8Array.from(
        atob(text)
            .split('')
            .map((c) => c.charCodeAt(0)),
    )
    return new TextDecoder().decode(u8a)
}
