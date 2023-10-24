// =====
// enums
// =====

// date range options for price charts
export enum TcgPlayerChartDateRange{
  OneMonth = '1 Month',
  OneYear = '1 Year',
  SixMonths = '6 Months',
  ThreeMonths = '3 Months',
}

// TcgPlayerChartDataRange -> date range button label
export const TcgPlayerChartDataRangeToDateRangeButton: { 
  [key in TcgPlayerChartDateRange]: String 
} = {
  [TcgPlayerChartDateRange.OneMonth]: '1M',
  [TcgPlayerChartDateRange.OneYear]: '1Y',
  [TcgPlayerChartDateRange.SixMonths]: '6M',
  [TcgPlayerChartDateRange.ThreeMonths]: '3M'
}

// TcgPlayerChartDataRange -> date range chart label
export const TcgPlayerChartDataRangeToDateRangeChart: { 
  [key in TcgPlayerChartDateRange]: String 
} = {
  [TcgPlayerChartDateRange.OneMonth]: 'Past Month',
  [TcgPlayerChartDateRange.OneYear]: 'Past Year',
  [TcgPlayerChartDateRange.SixMonths]: 'Past 6 Months',
  [TcgPlayerChartDateRange.ThreeMonths]: 'Past 3 Months'
}


// ==========
// validators
// ==========

/*
DESC
  Determines if the input is a valid price date range from TCGPlayer
  The expected regex format is: 
    \d{1,2}\/\d{1,2} to \d{1,2}\/\d{1,2}
INPUT
  value: The string to validate
RETURN
  TRUE if the input is a valid price date range from TCGPlayer, FALSE otherwise
*/
export function isTCGPlayerDateRange(value: string) {
  const regexp = new RegExp('^\\d{1,2}\\/\\d{1,2} to \\d{1,2}\\/\\d{1,2}$');
  return regexp.test(value);
}