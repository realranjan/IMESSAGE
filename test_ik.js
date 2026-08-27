import ImageKit from "imagekit";
try {
  const imagekit = new ImageKit({
    privateKey: "private_dluDxuv0WmnM39eu1VvSL9R8l6U="
  });
  console.log("Initialized!");
} catch (err) {
  console.log("Error initializing:", err.message);
}
