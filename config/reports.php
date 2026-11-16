<?php
// config/reports.php

return [
    /*
    |--------------------------------------------------------------------------
    | Brand palette — mirrors resources/css/app.css @theme tokens
    |--------------------------------------------------------------------------
    | Hex equivalents of your oklch brand tokens, chosen because
    | DOMPDF + PhpSpreadsheet both need hex, not oklch.
    */
    'colors' => [
        'primary' => '#1B5E20', // Kitui Green
        'primary_light' => '#2E7D32',
        'primary_soft' => '#F0FDF4', // tint for zebra/summary
        'red' => '#D32F2F', // Emergency Red
        'red_dark' => '#B71C1C',
        'amber' => '#F59E0B',
        'purple' => '#8B5CF6',
        'slate_900' => '#111827',
        'slate_700' => '#374151',
        'slate_500' => '#6B7280',
        'slate_300' => '#D1D5DB',
        'slate_200' => '#E5E7EB',
        'slate_100' => '#F3F4F6',
        'slate_50' => '#F9FAFB',
    ],

    /*
    |--------------------------------------------------------------------------
    | Report identity — shown in PDF header/footer and Excel sheet
    |--------------------------------------------------------------------------
    */
    'brand' => [
        'name' => 'Kitui County GBV Information System',
        'short_name' => 'Kitui GBV',
        'county' => 'Kitui County',
        'tagline' => 'Gender-Based Violence Information System',
        'logo' => 'logo.png',              // public/logo.png
        'confidential' => 'Confidential — For Authorized Use Only',
        'generated_by' => 'Kitui County Government',
    ],

    /*
    |--------------------------------------------------------------------------
    | Emergency contacts — pulled into report footers
    |--------------------------------------------------------------------------
    */
    'contacts' => [
        'gbv_helpline' => '1195',
        'police' => '999',
        'child_helpline' => '116',
        'hospital' => '1195',
    ],
];