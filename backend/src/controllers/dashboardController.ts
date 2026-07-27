import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      todayAppointments,
      activeDoctors,
      occupiedBeds,
      totalBeds,
      todayRevenue,
      pendingLabTests,
      pendingRadiology,
      emergencyVisits,
      lowStockMedicines,
      monthlyRevenue,
      departmentStats,
    ] = await Promise.all([
      prisma.patient.count({ where: { isActive: true } }),
      prisma.appointment.count({
        where: {
          appointmentDate: { gte: today, lt: tomorrow },
          status: { not: "CANCELLED" },
        },
      }),
      prisma.doctor.count({ where: { isAvailable: true } }),
      prisma.bedOccupancy.count({ where: { dischargeDateActual: null } }),
      prisma.bed.count(),
      prisma.payment.aggregate({
        where: { paymentDate: { gte: today, lt: tomorrow } },
        _sum: { amount: true },
      }),
      prisma.labTest.count({ where: { status: "PENDING" } }),
      prisma.radiology.count({ where: { status: "PENDING" } }),
      prisma.emergencyVisit.count({ where: { status: { in: ["WAITING", "IN_TREATMENT", "UNDER_OBSERVATION"] } } }),
      prisma.medicine.count({
        where: {
          stockQuantity: { lte: prisma.medicine.fields.reorderLevel },
        },
      }),
      // Monthly revenue (last 6 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', payment_date) as month,
          SUM(amount) as revenue
        FROM payments
        WHERE payment_date >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', payment_date)
        ORDER BY month ASC
      `,
      // Department stats
      prisma.department.findMany({
        include: {
          _count: { select: { doctors: true, staff: true } },
          doctors: {
            include: {
              _count: { select: { appointments: true } },
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalPatients,
          todayAppointments,
          activeDoctors,
          bedOccupancy: { occupied: occupiedBeds, total: totalBeds, rate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0 },
          todayRevenue: todayRevenue._sum.amount || 0,
          pendingLabTests,
          pendingRadiology,
          emergencyVisits,
          lowStockMedicines,
        },
        monthlyRevenue,
        departmentStats: departmentStats.map((d) => ({
          id: d.id,
          name: d.name,
          doctorCount: d._count.doctors,
          staffCount: d._count.staff,
          totalAppointments: d.doctors.reduce((sum, doc) => sum + doc._count.appointments, 0),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentActivity = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [recentPatients, recentAppointments, recentLabTests, recentEmergency] = await Promise.all([
      prisma.patient.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, firstName: true, lastName: true, patientNumber: true, createdAt: true },
      }),
      prisma.appointment.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          patient: { select: { firstName: true, lastName: true } },
          doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      }),
      prisma.labTest.findMany({
        where: { status: "COMPLETED" },
        orderBy: { resultDate: "desc" },
        take: 5,
        include: {
          patient: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.emergencyVisit.findMany({
        where: { status: { not: "DISCHARGED" } },
        orderBy: { arrivalTime: "desc" },
        take: 5,
        include: {
          patient: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        recentPatients,
        recentAppointments,
        recentLabTests,
        recentEmergency,
      },
    });
  } catch (error) {
    next(error);
  }
};
