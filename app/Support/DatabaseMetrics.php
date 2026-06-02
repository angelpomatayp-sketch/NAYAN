<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class DatabaseMetrics
{
    public static function diff(string $unit, string $startColumn, string $endColumn): string
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            $seconds = "EXTRACT(EPOCH FROM ({$endColumn} - {$startColumn}))";

            return match ($unit) {
                'day' => "({$seconds} / 86400)",
                'hour' => "({$seconds} / 3600)",
                'minute' => "({$seconds} / 60)",
                default => $seconds,
            };
        }

        return match ($unit) {
            'day' => "TIMESTAMPDIFF(DAY, {$startColumn}, {$endColumn})",
            'hour' => "TIMESTAMPDIFF(HOUR, {$startColumn}, {$endColumn})",
            'minute' => "TIMESTAMPDIFF(MINUTE, {$startColumn}, {$endColumn})",
            default => "TIMESTAMPDIFF(SECOND, {$startColumn}, {$endColumn})",
        };
    }

    public static function monthBucket(string $column): string
    {
        return DB::connection()->getDriverName() === 'pgsql'
            ? "TO_CHAR({$column}, 'YYYY-MM')"
            : "DATE_FORMAT({$column}, '%Y-%m')";
    }

    public static function currentMonthRange(): array
    {
        return [now()->startOfMonth(), now()->copy()->endOfMonth()];
    }

    public static function priorityOrder(string $column): string
    {
        return "CASE {$column} WHEN 'urgente' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 WHEN 'baja' THEN 4 ELSE 5 END";
    }

    public static function booleanSum(string $column): string
    {
        return "SUM(CASE WHEN {$column} THEN 1 ELSE 0 END)";
    }
}
