import sharp from "sharp";
import fs from "fs";
import path from "path";

const publicDir = "./public";

// নির্দিষ্ট ফাইলের জন্য কাস্টম সাইজ ও কোয়ালিটি (Lighthouse রিপোর্ট অনুযায়ী)
const customRules = {
  "banner.jpg": { width: 1355, height: 452, quality: 75 },
  "banner.png": { width: 1355, height: 452, quality: 75 },
  "icon-192.png": { width: 192, height: 192, quality: 80 },
};

async function processFolder(folderPath) {
  const items = fs.readdirSync(folderPath);

  for (const item of items) {
    const fullPath = path.join(folderPath, item);
    const stat = fs.statSync(fullPath);

    // সাব-ফোল্ডার থাকলে সেটার ভেতরেও ঢুকবে
    if (stat.isDirectory()) {
      await processFolder(fullPath);
      continue;
    }

    const ext = path.extname(item).toLowerCase();
    // শুধু jpg, jpeg, png ফাইলগুলো প্রসেস করবে
    if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;

    const baseName = path.basename(item, ext);
    const outputPath = path.join(folderPath, `${baseName}.webp`);
    const rule = customRules[item];

    try {
      let pipeline = sharp(fullPath);

      if (rule) {
        // ব্যানার বা লোগোর জন্য নির্দিষ্ট সাইজ
        pipeline = pipeline.resize(rule.width, rule.height, { fit: "cover" });
      } else {
        // বাকি সাধারণ ইমেজের সর্বোচ্চ প্রস্থ 1200px রাখবে (ছোট হলে বড় করবে না)
        pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true });
      }

      await pipeline
        .webp({ quality: rule ? rule.quality : 78 })
        .toFile(outputPath);

      const oldKB = (stat.size / 1024).toFixed(1);
      const newKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
      console.log(`✅ ${item} (${oldKB} KB) -> ${baseName}.webp (${newKB} KB)`);
    } catch (err) {
      console.error(`❌ সমস্যা হয়েছে ${item} ফাইলে:`, err.message);
    }
  }
}

console.log("⏳ ইমেজ অপ্টিমাইজেশন শুরু হচ্ছে...");
await processFolder(publicDir);
console.log("🎉 সব ইমেজ WebP ফরম্যাটে তৈরি হয়ে গেছে!");
