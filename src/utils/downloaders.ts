/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 本地下载工具
 */
import JSZip from 'jszip'

/**
 * @description 下载文件
 * @param { Blob } blob 文件的blob
 * @param { string } fileName 文件名(包含扩展名)
 */
export const download = (blob: Blob, fileName: string) => {
    const link = document.createElement('a')
    const url = window.URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }, 1000)
}

/**
 * @description 下载文件
 * @param { string } imgBase64 base64或URL
 * @param { string } fileName 文件名(包含扩展名)
 */
export const downloadFromBase64 = (imgBase64: string, fileName: string) => {
    const link = document.createElement('a')
    link.setAttribute('href', imgBase64)
    link.setAttribute('download', fileName)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
        document.body.removeChild(link)
    }, 1000)
}

type XlsDesc = {
    colspan: number | string
    content: number | string
}

type XlsStructureInfo = {
    type: string
    content: string[]
}

/**
 * 导出excle方法
 * structureInfo: { type: '结构化类型', content: 结构化内容 } 如：{ type: '人', content: ['性别： 男', '年龄： 儿童', ....] }
 */
export const downloadExcel = (titleArr: string[], contentArr: string[][], fileName: string, xlsDesc?: XlsDesc, structureInfo?: XlsStructureInfo) => {
    const blob = getExcelFile(titleArr, contentArr, fileName, xlsDesc, structureInfo)
    download(blob, fileName)
}

const createExcelTemplate = (titleArr: string[], contentArr: string[][], xlsDesc?: XlsDesc, structureInfo?: XlsStructureInfo) => {
    const structHead = structureInfo
        ? structureInfo.content
              .map((item, index) => {
                  return rawXml`
                        <tr>
                            <th>${index === 0 ? structureInfo.type : ''}</th>
                            <th>${item}</th>
                        </tr>
                    `
              })
              .join('')
        : ''
    const content = contentArr
        .map((tr) => {
            return `<tr>${tr.map((td) => `<td style='vnd.ms-excel.numberformat:@'>${td}</td>`).join('')}</tr>`
        })
        .join('')
    return rawXml`
        <table cellspacing='0' cellpadding='0' border='1' style='display:none'>
            <thead>
                ${structHead}
                ${xlsDesc ? `<tr><th colspan="${xlsDesc.colspan}">${xlsDesc.content}</th></tr>` : ''}
                <tr>${titleArr.map((item) => `<th>${item}</th>`).join('')}</tr>
            </thead>
            <tbody>${content}</tbody>
        </table>
    `
}

export const getExcelFile = (titleArr: string[], contentArr: string[][], fileName: string, xlsDesc?: XlsDesc, structureInfo?: XlsStructureInfo) => {
    const table = createExcelTemplate(titleArr, contentArr, xlsDesc, structureInfo)
    const template =
        "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel'" +
        "xmlns='http://www.w3.org/TR/REC-html40'><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>" +
        `<x:Name>${fileName || 'Worksheet'}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets>` +
        '</x:ExcelWorkbook></xml><![endif]-->' +
        "<style type='text/css'>table td, table th {height: 50px;text-align: center;font-size: 18px;}</style>" +
        `</head><body>${table}</body></html>`

    const bom = new Uint8Array([0xef, 0xbb, 0xbf]) // UTF-8 BOM
    return new Blob([bom, template], { type: 'text/csv' })
}

export type DownloadZipOptions = {
    zipName: string
    files: { name: string; content: string | ArrayBuffer; folder: string }[]
}

export const downloadZip = (options: DownloadZipOptions) => {
    return new Promise((resolve) => {
        const zipName = options.zipName || 'demo'
        const files = options.files || []

        if (!files.length) {
            resolve(void 0)
            return
        }

        const zip = new JSZip()
        const folders: Record<string, JSZip | null> = {}

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const name = file.name
            const content = file.content
            const folder = file.folder
            if (folder && !folders[folder]) {
                folders[folder] = zip.folder(folder)
            }
            const obj = folders[folder] || zip
            // 判断是否为图片文件
            const isImg = /\.(png|jpe?g|gif|svg)(\?.*)?$/.test(name)
            if (isImg) {
                obj.file(name, (content as string).replace(/data:image\/(png|jpg);base64,/, ''), { base64: true })
            } else {
                if (typeof content === 'string') {
                    if (!content.length) {
                        // 跳过空录像文件
                        files.splice(i, 1)
                        i--
                        continue
                    }
                } else if (!content.byteLength) {
                    files.splice(i, 1)
                    i--
                    continue
                }
                obj.file(name, content)
            }
        }

        zip.generateAsync({ type: 'blob' }).then((content) => {
            download(content, zipName + '.zip')
            // see FileSaver.js
            // saveAs(content, zipName + ".zip")
            resolve(void 0)
        })
    })
}
