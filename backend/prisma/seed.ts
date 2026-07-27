import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create roles
  const roles = [
    { name: "ADMIN", description: "System Administrator" },
    { name: "DOCTOR", description: "Medical Doctor" },
    { name: "NURSE", description: "Nurse" },
    { name: "RECEPTIONIST", description: "Receptionist" },
    { name: "PHARMACIST", description: "Pharmacist" },
    { name: "ACCOUNTANT", description: "Accountant" },
    { name: "LAB_TECHNICIAN", description: "Lab Technician" },
    { name: "RADIOLOGIST", description: "Radiologist" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });

  await prisma.user.upsert({
    where: { email: "admin@hospital.com" },
    update: {},
    create: {
      email: "admin@hospital.com",
      password: adminPassword,
      firstName: "مدير",
      lastName: "النظام",
      roles: { create: { roleId: adminRole!.id } },
    },
  });

  // Create departments
  const departments = [
    { name: "الطوارئ", description: "Emergency Department" },
    { name: "الباطنية", description: "Internal Medicine" },
    { name: "الجراحة", description: "Surgery" },
    { name: "الأطفال", description: "Pediatrics" },
    { name: "الولادة", description: "Obstetrics & Gynecology" },
    { name: "العناية المركزة", description: "ICU" },
    { name: "الأشعة", description: "Radiology" },
    { name: "المختبر", description: "Laboratory" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }

  // Create sample rooms and beds
  const roomTypes = ["PRIVATE", "SEMI_PRIVATE", "WARD", "ICU"] as const;
  for (let i = 1; i <= 20; i++) {
    const room = await prisma.room.create({
      data: {
        roomNumber: `R${String(i).padStart(3, "0")}`,
        roomType: roomTypes[i % 4],
        capacity: (i % 4) === 2 ? 4 : (i % 4) === 3 ? 1 : 2,
        floor: String(Math.ceil(i / 5)),
      },
    });

    // Create beds for each room
    const bedCount = room.capacity;
    for (let b = 1; b <= bedCount; b++) {
      await prisma.bed.create({
        data: {
          roomId: room.id,
          bedNumber: `B${b}`,
          status: "AVAILABLE",
        },
      });
    }
  }

  // Create sample medicines
  const medicines = [
    { name: "باراسيتامول", genericName: "Paracetamol", category: "مسكن", unitPrice: 15, stockQuantity: 500, reorderLevel: 50 },
    { name: "أموكسيسيلين", genericName: "Amoxicillin", category: "مضاد حيوي", unitPrice: 25, stockQuantity: 300, reorderLevel: 30 },
    { name: "إيبوبروفين", genericName: "Ibuprofen", category: "مضاد التهاب", unitPrice: 20, stockQuantity: 200, reorderLevel: 25 },
    { name: "أوميبرازول", genericName: "Omeprazole", category: "مضاد حموضة", unitPrice: 35, stockQuantity: 150, reorderLevel: 20 },
    { name: "ميتفورمين", genericName: "Metformin", category: "سكري", unitPrice: 40, stockQuantity: 100, reorderLevel: 15 },
  ];

  for (const med of medicines) {
    await prisma.medicine.create({ data: med });
  }

  console.log("✅ Seeding completed!");
  console.log("🔑 Default admin login:");
  console.log("   Email: admin@hospital.com");
  console.log("   Password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
