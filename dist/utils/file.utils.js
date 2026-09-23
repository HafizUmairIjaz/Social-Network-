import fs from "fs/promises";
import path from "path";
// folder location
const uploadDir = path.join(process.cwd(), "uploads", "avatars");
export const saveAvatar = async (fileBuffer, fileName) => {
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, fileBuffer);
    return `/uploads/avatars/${fileName}`;
};
