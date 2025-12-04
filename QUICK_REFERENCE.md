# Quick Reference - Interview Cheat Sheet

## Core Functions (Know These!)

### `parse_cron_field(field, min_val, max_val)`
- **Purpose**: Parse a single cron field (handles *, ranges, steps, lists)
- **Returns**: Sorted list of integers
- **Key logic**: Split by comma → process each part → use Set for deduplication

### `parse_cron(cron_string)`
- **Purpose**: Parse full cron expression into components
- **Returns**: Dict with 'minutes', 'hours', 'days', 'months', 'weekdays', 'command'
- **Key logic**: Split by space → parse each field → return structured data

### `get_next_occurrence(cron_string, reference_date)`
- **Purpose**: Find next matching date/time
- **Returns**: datetime object
- **Algorithm**: Incremental search (minute-by-minute) with validation
- **Safety**: 11-year limit to prevent infinite loops

## Key Design Decisions

1. **Minute-by-minute search**: Simple, correct, handles all edge cases
2. **Set for deduplication**: Automatic handling of overlapping ranges
3. **Helper functions**: Encapsulate increment logic, use `nonlocal` for state
4. **11-year limit**: Safety mechanism for impossible cron expressions

## Edge Cases Handled

✅ Leap years (Feb 29) - `calendar.monthrange()`  
✅ Month boundaries (31st day in short months) - Filter `allowed_days`  
✅ Day-of-month vs day-of-week conflicts - Both must match  
✅ Impossible dates (Feb 30) - Returns empty results  
✅ Invalid syntax - Clear error messages at parse time  

## Common Questions & Quick Answers

**Q: Time complexity?**  
A: O(M) where M is minutes to check. Usually much better in practice.

**Q: Why Python?**  
A: `datetime` and `calendar` modules simplify date handling, especially leap years.

**Q: Why dictionary instead of class?**  
A: Simplicity and flexibility. Easy to iterate and access.

**Q: How handle day-of-month vs day-of-week?**  
A: Both must match (AND logic). Validated in `validate_day_and_weekday_of_the_date()`.

**Q: Why 11-year limit?**  
A: Calendar repetition cycle + safety for impossible expressions.

**Q: How optimize?**  
A: Cache parsed expressions, smart skipping for common patterns, pre-compute valid dates.

## Code Locations to Know

- **Field parsing**: `cron_parser.py` lines 64-166
- **Next occurrence**: `cron_parser.py` lines 169-324
- **Day increment**: `cron_parser.py` lines 223-248
- **Validation**: `cron_parser.py` lines 291-301

## Test Coverage

- 29 tests total
- Field parsing (wildcards, ranges, steps, errors)
- Cron parsing (simple, complex, invalid)
- Next occurrence (overflows, leap years)
- Edge cases (impossible dates, conflicts)

## Potential Extensions

1. **Special strings** (@yearly, @daily) - Preprocessing step
2. **Timezone support** - Use `pytz` or `zoneinfo`, convert to UTC
3. **Seconds field** - Extend to 6 fields
4. **Performance** - Cache, smart skipping, interval math

## Debugging Tips

1. Check weekday conversion (Python Monday=0, Cron Sunday=0)
2. Verify month boundaries (filter allowed days)
3. Check both day-of-month AND day-of-week match
4. Use test cases as reference
5. Add debug prints in validation functions

## Be Ready To

- Walk through `parse_cron_field` step-by-step
- Explain the `get_next_occurrence` algorithm
- Discuss trade-offs (simplicity vs performance)
- Suggest improvements and extensions
- Debug a failing cron expression
- Explain edge case handling

---

**Remember**: Think aloud, ask clarifying questions, discuss trade-offs!

