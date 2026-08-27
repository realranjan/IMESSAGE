import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_dummy",
  privateKey: process.env.IMAGEKIT_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/dummy",
});

function hasImageKitConfig() {
  return Boolean(process.env.IMAGEKIT_KEY);
}
// renameing of files
function createFileName(originalName = "upload") {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `chat-${Date.now()}-${safeName}`;
}

async function uploadChatMedia(file) {
  const fileName = createFileName(file.originalname);

  const result = await imagekit.files.upload({
    file: file.buffer.toString("base64"),
    fileName,
    folder: "/chat",
  });
  
  // If the user hasn't provided the exact urlEndpoint, we need to correct the URL if possible, but ImageKit returns result.url
  return result.url;
}

export { uploadChatMedia, hasImageKitConfig };
