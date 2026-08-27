import 'dotenv/config';
import ImageKit from "@imagekit/nodejs";

console.log("Checking keys:");
console.log("public:", process.env.IMAGEKIT_PUBLIC_KEY);
console.log("private:", process.env.IMAGEKIT_KEY);
console.log("url:", process.env.IMAGEKIT_URL_ENDPOINT);

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_dummy",
  privateKey: process.env.IMAGEKIT_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/dummy",
});

async function testUpload() {
  try {
    const result = await imagekit.files.upload({
      file: Buffer.from("hello world test").toString("base64"),
      fileName: `test-${Date.now()}.txt`,
      folder: "/chat",
    });
    console.log("Upload Success:", result.url);
  } catch (err) {
    console.log("Upload Failed:", err.message, err.help);
  }
}

testUpload();
