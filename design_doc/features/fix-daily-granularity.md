// BUG FIX REQUIREMENTS: Yahoo Finance Daily Data Granularity
//
// PROBLEM:
// Yahoo Finance returns monthly data when using `range=max`,
// even if `interval=1d` is specified. This breaks ATH calculations.
//
// SOLUTION OVERVIEW:
// Do NOT request full historical data.
// Instead, fetch daily data only from a manually provided ATH date
// up to the current date.
//
// DATA FETCHING RULES:
// - MUST use `period1` and `period2` (UNIX timestamps)
// - MUST NOT use `range=max`
// - interval MUST be `1d`
// - period1 = athDate (converted to UNIX timestamp)
// - period2 = current time (UNIX timestamp)

