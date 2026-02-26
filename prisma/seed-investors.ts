import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import path from "path";

const prisma = new PrismaClient();

const CSV_PATH = path.join(__dirname, "investors.csv");

/** أعمدة CSV: investorName, nationalId, phonenumber, Password, الصورة الشخصية */
const COL = {
  investorName: "investorName",
  nationalId: "nationalId",
  phonenumber: "phonenumber",
  Password: "Password",
  profilePicture: "الصورة الشخصية",
} as const;

function trim(s: string | undefined): string {
  if (s == null || s === "") return "";
  return String(s).trim();
}

/** يفسر سطر CSV واحد (محتوى داخل الاقتباس) إلى مصفوفة حقول */
function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      i++;
      let field = "";
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          field += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          field += line[i];
          i++;
        }
      }
      out.push(field);
    } else {
      let field = "";
      while (i < line.length && line[i] !== ",") {
        field += line[i];
        i++;
      }
      out.push(field.trim());
      if (i < line.length) i++;
    }
    if (line[i] === ",") i++;
  }
  return out;
}

async function main() {
  const raw = readFileSync(CSV_PATH, "utf-8").replace(/\r\n/g, "\n").trim();
  const parsed = parse(raw, {
    columns: false,
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true,
  }) as string[][];

  if (parsed.length === 0) throw new Error("ملف CSV فارغ.");
  const rawHeader = parsed[0][0] ?? "";
  const header = parseCSVLine(rawHeader.startsWith('"') ? rawHeader.slice(1, -1).replace(/""/g, '"') : rawHeader);
  const nameIdx = header.indexOf(COL.investorName);
  const nationalIdIdx = header.indexOf(COL.nationalId);
  const phoneIdx = header.indexOf(COL.phonenumber);
  const passwordIdx = header.indexOf(COL.Password);
  const pictureIdx = header.indexOf(COL.profilePicture);

  if (nameIdx === -1 || passwordIdx === -1) {
    throw new Error(
      `لم يتم العثور على الأعمدة المطلوبة (investorName, Password). المتوفر: ${header.join(", ")}`
    );
  }

  let created = 0;
  let skipped = 0;

  for (let i = 1; i < parsed.length; i++) {
    const rawRow = parsed[i][0] ?? "";
    const content = rawRow.startsWith('"') ? rawRow.slice(1, -1).replace(/""/g, '"') : rawRow;
    const values = parseCSVLine(content);
    const name = trim(values[nameIdx]);
    const nationalId = trim(values[nationalIdIdx] ?? "");
    const phone = trim(values[phoneIdx] ?? "");
    const password = trim(values[passwordIdx] ?? "");
    const profilepicture = trim(values[pictureIdx] ?? "");

    if (!name) {
      skipped++;
      continue;
    }
    if (!password) {
      console.warn(`تخطي "${name}": كلمة المرور فارغة`);
      skipped++;
      continue;
    }

    const data = {
      name,
      phoneNumber: phone || null,
      password,
      profilepicture: profilepicture || null,
      isAdmin: false,
      email: null,
      nationalId: nationalId || null,
    };

    const existing = await prisma.user.findFirst({
      where: {
        name,
        phoneNumber: data.phoneNumber,
      },
    });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.user.create({ data });
    created++;
    console.log(`تم إضافة: ${name}`);
  }

  console.log(`\nانتهى الـ seeding: ${created} مستثمر مضاف، ${skipped} تم تخطيهم.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
