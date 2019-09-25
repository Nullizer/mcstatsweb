export async function getLang (langCode: string) {
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
      return fetch(url, { mode: 'no-cors' })
    }).then(r => r.json())
}
