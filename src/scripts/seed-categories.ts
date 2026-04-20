import { db } from "@/db";
import { categories } from "@/db/schema";

const categoryNames = [
  "Ô tô và xe cộ",
  "Hài kịch",
  "Giáo dục",
  "Trò chơi",
  "Giải trí",
  "Phim và hoạt hình",
  "Hướng dẫn và phong cách",
  "Âm nhạc",
  "Tin tức và chính trị",
  "Mọi người và blog",
  "Thú cưng và động vật",
  "Khoa học và công nghệ",
  "Thể thao",
  "Du lịch và sự kiện",
];

async function main() {
  console.log("Seeding categories...");

  try {
    const values = categoryNames.map((name) => ({
      name,
      description: `Video thuộc danh mục ${name.toLowerCase()}`,
    }));

    await db.insert(categories).values(values);

    console.log("Categories seeded successfully!");
  } catch (error) {
    console.error("Error seeding categories: ", error);
    process.exit(1);
  }
}

main();
