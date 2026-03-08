## Packages
date-fns | Needed for precise date calculations (finding last 10 Sundays)
recharts | Needed for the historical attendance line chart
next-themes | Used for the light/dark mode theme toggle
lucide-react | Used for beautiful iconography in the form

## Notes
The application expects `date` field in PostgreSQL to be returned as a string (`YYYY-MM-DD` or ISO). We handle timezone-safe date comparisons by matching the `YYYY-MM-DD` string portion.
