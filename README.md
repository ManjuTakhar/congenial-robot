# Cron Expression Parser

This project is a command-line application designed to parse cron strings and expand each field to show the times at which the cron job will run. The implementation is in **JavaScript** and does not rely on existing cron parser libraries, showcasing the ability to create a custom solution.

## Features

- Parses standard cron format with five time fields (minute, hour, day of month, month, and day of week) plus a command.
- Outputs the parsed cron string as a table (field name + expanded values) or as structured data.
- Handles a subset of cron strings correctly, prioritizing functionality over handling all possible cron strings.
- Supports wildcards (`*`), ranges (`1-5`), steps (`*/15`, `1-10/5`), and comma-separated lists (`1,15`).

## Cron Expression Format

The parser supports the standard cron format:
```
minute hour day-of-month month day-of-week command
```

### Supported Syntax

- **Wildcard**: `*` (matches all values)
- **Range**: `1-5` (matches 1, 2, 3, 4, 5)
- **Step**: `*/15` (every 15 units), `1-10/5` (1, 6)
- **List**: `1,15` (matches 1 and 15)
- **Combinations**: `1-10/5,3-12/3` (matches 1, 3, 6, 9, 12)

### Field Ranges

- **minute**: 0-59
- **hour**: 0-23
- **day of month**: 1-31
- **month**: 1-12 (1 = January, 12 = December)
- **day of week**: 0-6 (0 = Sunday, 6 = Saturday)

### Day-of-month vs Day-of-week semantics

When both **day-of-month** and **day-of-week** are restricted (i.e. not `*`), a date/time is considered a match **only if it satisfies both fields**:

- The calendar day must be in the allowed **day-of-month** set
- The weekday must be in the allowed **day-of-week** set

Examples:
- `0 0 1 * 1` – runs at midnight on dates that are **both** the 1st of the month **and** a Monday.
- `0 0 * * 1` – runs every Monday at midnight (any day-of-month).

## Examples

```bash
# Every 15 minutes
node cron_parser_command.js "*/15 * * * * /usr/bin/find"

# Every day at midnight
node cron_parser_command.js "0 0 * * * /usr/bin/backup"

# Every Monday at 9:30 AM
node cron_parser_command.js "30 9 * * 1 /usr/bin/script"

# Complex expression
node cron_parser_command.js "*/15 0 1,15 * 1-5 /usr/bin/find"
```

## Error Handling

The parser validates cron expressions and provides clear error messages for:
- Invalid field syntax (multiple slashes, invalid ranges, etc.)
- Values outside allowed ranges
- Missing required fields
- Invalid date combinations (e.g., February 30)

## Development

### Testing (JavaScript)

The Jest test suite covers:
- ✅ Field parsing with various syntaxes
- ✅ Error cases and validation
- ✅ Next occurrence calculations
- ✅ Edge cases (leap years, month boundaries)
- ✅ Complex cron expressions
You can run them with:

```bash
npm install
npx jest
```

---

## License

This project is provided as-is for educational and assessment purposes.
