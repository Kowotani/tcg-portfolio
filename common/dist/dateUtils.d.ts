export declare function genDateRange(startDate: Date, endDate: Date): Date[];
export declare function genFirstOfMonthDateRange(startDate: Date, endDate: Date): Date[];
export declare function genFirstOfQuarterDateRange(startDate: Date, endDate: Date): Date[];
export declare function genFirstOfYearDateRange(startDate: Date, endDate: Date): Date[];
export declare function genSundayOfWeekDateRange(startDate: Date, endDate: Date): Date[];
export declare function formatAsISO(date: Date): string;
export declare function formatInTimeZone(date: Date, dateFormat: string, timezone: string): string;
export declare function getClampedDate(date: Date, startDate: Date, endDate: Date): Date;
export declare function getDaysBetween(startDate: Date, endDate: Date): number;
