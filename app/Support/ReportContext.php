<?php
// app/Support/ReportContext.php

namespace App\Support;

class ReportContext
{
    /**
     * Build the shared context used by every PDF view.
     *
     * @param  array<string, mixed>  $extra  Page-specific data (filters, counts, etc.)
     * @return array<string, mixed>
     */
    public static function make(array $extra = []): array
    {
        $brand = config('reports.brand');
        $contacts = config('reports.contacts');
        $colors = config('reports.colors');

        return array_merge([
            'brand' => $brand,
            'contacts' => $contacts,
            'colors' => $colors,
            'logoPath' => public_path($brand['logo']),
            'generatedAt' => now(),
            'locale' => app()->getLocale(),
        ], $extra);
    }
}