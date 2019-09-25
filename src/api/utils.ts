import path from 'path'
import { promises as fs, readFileSync } from 'fs'
import TOML from '@iarna/toml'

const config: any = TOML.parse(readFileSync(path.resolve(__dirname, '../../config.toml'), {
  encoding: 'utf-8'
}))

const worldDir = config.api['world-dir']

export async function getPlayers () {
  const uuids = await getUUIDList()
  return Promise.all(uuids.map(async uuid => ({
    uuid,
    name: await getPlayerName(uuid)
  })))
}

async function getUUIDList () {
  const uuids: string[] = await fs.readdir(path.resolve(worldDir, 'playerdata/'))
    .then(r => r.map(f => path.parse(f).name))
  return uuids
}

export function getAdvancements (uuid: string) {
  return readJSON(path.resolve(worldDir, 'advancements/', uuid + '.json'))
}

export function getStats (uuid: string) {
  return readJSON(path.resolve(worldDir, 'stats/', uuid + '.json'))
}

async function readJSON (path: string) {
  const content = await fs.readFile(path, { encoding: 'utf-8' })
  return JSON.parse(content)
}

/* global globalThis */
if (!globalThis.fetch) {
  globalThis.fetch = require('node-fetch')
}

const LANGS = new Map()

export async function getLang (langCode: string) {
  if (LANGS.has(langCode)) return LANGS.get(langCode)
  return fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json')
    .then(r => r.json()).then(manifest => {
      const versions: { id: string, url: string }[] = manifest.versions
      const latest = versions.find(ver => ver.id === manifest.latest.release)
      if (!latest) {
        // TODO: new Error class
        throw new Error('Cant found latest version info')
      }
      return latest.url
    })
    .then(url => fetch(url)).then(r => r.json())
    .then(versionInfo => versionInfo.assetIndex.url)
    .then(url => fetch(url)).then(r => r.json())
    .then(assetIndex => assetIndex.objects[`minecraft/lang/${langCode}.json`].hash)
    .then((hash: string) => {
      const url = `https://resources.download.minecraft.net/${hash.substring(0, 2)}/${hash}`
      return fetch(url)
    }).then(r => {
      const langContent = r.json()
      LANGS.set(langCode, langContent)
      return langContent
    })
}

interface nameCacheItem {
  name: string
  updatedAt: Date
}

const nameCache = new Map<string, nameCacheItem>()

async function getPlayerName (uuid: string) {
  const cacheItem = nameCache.get(uuid)
  if (cacheItem && (new Date()).getTime() - cacheItem.updatedAt.getTime() < 10 * 60 * 1000) {
    return cacheItem.name
  }
  const trimmed = uuid.replace(/-/g, '')
  const names = await fetch(`https://api.mojang.com/user/profiles/${trimmed}/names`).then(r => r.json())
  const latestName = names[0].name
  nameCache.set(uuid, {
    name: latestName,
    updatedAt: new Date()
  })
  return nameCache.get(uuid)!.name
}
