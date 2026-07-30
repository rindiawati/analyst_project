function normalizeDate(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

export function streakLength(
  checkIns: { date: Date }[],
  today: Date = new Date()
): number {
  const todayTime = normalizeDate(today);

  const checkInDays = new Set<number>();

  for (const checkIn of checkIns) {
    const dateTime = normalizeDate(checkIn.date);

    // Abaikan check-in masa depan
    if (dateTime <= todayTime) {
      checkInDays.add(dateTime);
    }
  }

  // Tidak ada check-in hari ini
  if (!checkInDays.has(todayTime)) {
    return 0;
  }

  let streak = 0;
  const oneDay = 24 * 60 * 60 * 1000;

  let currentDay = todayTime;

  while (checkInDays.has(currentDay)) {
    streak++;
    currentDay -= oneDay;
  }

  return streak;
}