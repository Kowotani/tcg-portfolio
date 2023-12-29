export declare function genDateRange(startDate: Date, endDate: Date): Date[];
export declare function genFirstOfMonthDateRange(startDate: Date, endDate: Date): Date[];
export declare function genFirstOfQuarterDateRange(startDate: Date, endDate: Date): Date[];
export declare function genFirstOfYearDateRange(startDate: Date, endDate: Date): Date[];
export declare function genSundayOfWeekDateRange(startDate: Date, endDate: Date): Date[];
export declare function areDatesEqual(first: Date, second: Date): boolean;
export declare function dateAdd(date: Date, duration: TDateMathDuration): Date;
export declare function dateSub(date: Date, duration: TDateMathDuration): Date;
export declare function formatAsISO(date: Date): string;
export declare function formatDateDiffAsYearsMonthsDays(startDate: Date, endDate: Date): string;
export declare function getClampedDate(date: Date, startDate: Date, endDate: Date): Date;
export declare function getDaysBetween(startDate: Date, endDate: Date): number;
export declare function getStartOfDate(date: Date): Date;
export declare function isDateAfter(first: Date, second: Date, orEqual?: boolean): boolean;
export declare function isDateBefore(first: Date, second: Date, orEqual?: boolean): boolean;
export declare function getDateThirtyDaysAgo(): Date;
export declare function getDateOneMonthAgo(): Date;
export declare function getDateThreeMonthsAgo(): Date;
export declare function getDateSixMonthsAgo(): Date;
export declare function getDateOneYearAgo(): Date;
export declare function formatInTimeZone(date: Date, dateFormat: string, timezone: string): string;
export declare function getClientTimezone(): string;
export declare function getLocalDateFromISOString(ISOString: string): Date;
declare type TDateMathDuration = {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
};
export {};
