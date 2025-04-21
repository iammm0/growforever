import fs from 'fs'
import path from 'path'
import {Fanwork} from "@/types/fanwork";

const dataDir = path.join(process.cwd(), 'data')
const profilePath = path.join(dataDir, 'profile.json')
const fanworksPath = path.join(dataDir, 'fanworks.json')

// 初始数据
const defaultProfile = {
    name: 'Liria',
    style: '幻想系数字绘画、精灵角色设计',
    bio: 'Liria 是一位数字艺术家，作品灵感来自于自然与森林的神秘氛围，擅长将 AI 与幻想融合。'
}

const defaultFanworks: Fanwork[] = []

function ensureDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
        console.log(`📁 创建目录: ${dirPath}`)
    }
}

function ensureFile(filePath: string, content: object) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8')
        console.log(`📄 创建文件: ${filePath}`)
    } else {
        console.log(`✅ 已存在: ${filePath}`)
    }
}

function main() {
    console.log('🛠️ 正在初始化数据文件...')
    ensureDir(dataDir)
    ensureFile(profilePath, defaultProfile)
    ensureFile(fanworksPath, defaultFanworks)
    console.log('✅ 初始化完成！')
}

main()
