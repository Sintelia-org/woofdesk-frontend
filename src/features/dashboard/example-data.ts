// Fixed example figures for dashboard metrics the backend does not expose yet:
// appointments only store a start datetime, and there are no sales or
// worked-hours endpoints. Replace each value with API data once it exists.
export const dashboardExampleData = {
  appointmentDurationMinutes: 90,
  monthlySales: 186400,
  monthlySalesCount: 24,
  monthlyWorkedHours: 71.5,
} as const;
