module.exports = {
  platforms: [
    { name: "Windows", slug: "windows" },
    { name: "macOS", slug: "mac" },
  ],
  categories: [
    { name: "Software", slug: "software", displayOrder: 1 },
    { name: "Plugins", slug: "plugins", displayOrder: 2 },
    { name: "Presets", slug: "presets", displayOrder: 3 },
    { name: "Fonts", slug: "fonts", displayOrder: 4 },
    { name: "Sound Effects", slug: "sound-effects", displayOrder: 5 },
  ],
  resources: [
    {
      name: "Topaz",
      slug: "topaz-windows",
      platformSlug: "windows",
      categorySlug: "software",
      downloadLink: "https://mega.nz/folder/RFNyBBqb#njLs0aEMbASRwcsWka9n7w",
      fixLink: "https://drive.google.com/file/d/1gbBavelChT9BWbpyngP7md4vVnIVVUOr/view?usp=sharing",
      tutorialChannelId: "-1003943904498",
      tutorialMessageId: 3,
      displayOrder: 1,
      isVisible: true,
    },
    {
      name: "Topaz",
      slug: "topaz-mac",
      platformSlug: "mac",
      categorySlug: "software",
      downloadLink: "https://mega.nz/folder/RFNyBBqb#njLs0aEMbASRwcsWka9n7w",
      fixLink: "https://drive.google.com/file/d/1gbBavelChT9BWbpyngP7md4vVnIVVUOr/view?usp=sharing",
      tutorialChannelId: "-1003943904498",
      tutorialMessageId: 3,
      displayOrder: 1,
      isVisible: true,
    },
  ],
  settings: [
    { key: "youtubeLink", value: process.env.YOUTUBE || "" },
    { key: "channelLink", value: process.env.CHANNEL || "" },
  ],
};