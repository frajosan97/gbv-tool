<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>@yield('title') | {{ $brand['short_name'] ?? $brand['name'] }}</title>
    <style>
        /* ========== PAGE ========== */
        @page {
            margin: 145px 32px 80px 32px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color:
                {{ $colors['slate_900'] }}
            ;
            margin: 0;
            line-height: 1.5;
        }

        /* ========== HEADER (FIXED) ========== */
        header {
            position: fixed;
            top: -130px;
            left: 0;
            right: 0;
            height: 120px;
        }

        header .header-inner {
            border-bottom: 3px solid
                {{ $colors['primary'] }}
            ;
            padding-bottom: 10px;
        }

        header .header-rule {
            height: 1px;
            background:
                {{ $colors['slate_200'] }}
            ;
            margin-top: 3px;
        }

        header table {
            width: 100%;
            border-collapse: collapse;
        }

        header td {
            vertical-align: middle;
            padding: 0;
        }

        header .logo {
            width: 90px;
        }

        header .logo img {
            height: 66px;
            width: auto;
        }

        header .title {
            text-align: right;
        }

        header h1 {
            font-size: 22px;
            font-weight: bold;
            margin: 0 0 4px 0;
            letter-spacing: 0.4px;
            color:
                {{ $colors['primary'] }}
            ;
        }

        header .subtitle {
            font-size: 11px;
            color:
                {{ $colors['slate_700'] }}
            ;
            font-weight: bold;
        }

        header .meta {
            font-size: 9px;
            color:
                {{ $colors['slate_500'] }}
            ;
            margin-top: 4px;
        }

        /* ========== FOOTER (FIXED) ========== */
        footer {
            position: fixed;
            bottom: -65px;
            left: 0;
            right: 0;
            height: 58px;
            border-top: 1px solid
                {{ $colors['slate_200'] }}
            ;
            padding-top: 7px;
            font-size: 9px;
            color:
                {{ $colors['slate_500'] }}
            ;
        }

        footer table {
            width: 100%;
            border-collapse: collapse;
        }

        footer td {
            vertical-align: top;
            padding: 0;
        }

        footer .right {
            text-align: right;
        }

        footer .confidential {
            color:
                {{ $colors['red'] }}
            ;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            font-size: 9px;
        }

        footer .pagenum:after {
            content: "Page " counter(page) " of " counter(pages);
        }

        /* ========== SECTION HEADING (list views) ========== */
        .section-header {
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid
                {{ $colors['slate_200'] }}
            ;
        }

        .section-header h2 {
            font-size: 14px;
            font-weight: bold;
            margin: 0;
            color:
                {{ $colors['primary'] }}
            ;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        .section-header .section-meta {
            font-size: 9.5px;
            color:
                {{ $colors['slate_500'] }}
            ;
            margin-top: 3px;
        }

        /* ========== SECTION (detail views) ========== */
        .section {
            margin-bottom: 14px;
        }

        .section-title {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color:
                {{ $colors['primary'] }}
            ;
            border-bottom: 1px solid
                {{ $colors['slate_200'] }}
            ;
            padding-bottom: 4px;
            margin-bottom: 8px;
        }

        .section-title .count {
            float: right;
            font-size: 9px;
            font-weight: normal;
            color:
                {{ $colors['slate_500'] }}
            ;
            text-transform: none;
            letter-spacing: 0;
        }

        /* ========== HERO (detail views) ========== */
        .hero {
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid
                {{ $colors['slate_200'] }}
            ;
        }

        .hero .org-name {
            font-size: 22px;
            font-weight: bold;
            color:
                {{ $colors['slate_900'] }}
            ;
            margin: 0 0 4px 0;
            letter-spacing: -0.2px;
        }

        .hero .sub-line {
            font-size: 10px;
            color:
                {{ $colors['slate_500'] }}
            ;
        }

        .hero .badges {
            margin-top: 8px;
        }

        /* ========== BADGES ========== */
        .badge {
            display: inline-block;
            padding: 3px 9px;
            border-radius: 9px;
            font-size: 8.5px;
            font-weight: bold;
            text-transform: capitalize;
            letter-spacing: 0.3px;
            margin-right: 5px;
        }

        .badge-approved,
        .badge-active,
        .badge-open,
        .badge-completed,
        .badge-accepted,
        .badge-verified {
            background:
                {{ $colors['primary_soft'] }}
            ;
            color:
                {{ $colors['primary'] }}
            ;
        }

        .badge-pending,
        .badge-in_progress,
        .badge-in-progress {
            background: #FEF3C7;
            color: #92400E;
        }

        .badge-rejected,
        .badge-closed,
        .badge-declined {
            background: #FFE4E6;
            color:
                {{ $colors['red_dark'] }}
            ;
        }

        .badge-suspended,
        .badge-inactive,
        .badge-unknown,
        .badge-unverified {
            background:
                {{ $colors['slate_200'] }}
            ;
            color:
                {{ $colors['slate_700'] }}
            ;
        }

        /* ========== DATA TABLE ========== */
        table.data {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
        }

        table.data thead {
            display: table-header-group;
        }

        table.data tr {
            page-break-inside: avoid;
        }

        table.data thead th {
            background:
                {{ $colors['primary'] }}
            ;
            color: #fff;
            text-align: left;
            padding: 9px;
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid
                {{ $colors['primary'] }}
            ;
            font-weight: bold;
        }

        table.data tbody td {
            padding: 8px 9px;
            border: 1px solid
                {{ $colors['slate_200'] }}
            ;
            vertical-align: top;
        }

        table.data tbody tr:nth-child(even) td {
            background:
                {{ $colors['slate_50'] }}
            ;
        }

        table.data tbody tr:last-child td {
            border-bottom: 2px solid
                {{ $colors['primary'] }}
            ;
        }

        table.data td.num {
            text-align: right;
            font-variant-numeric: tabular-nums;
        }

        table.data td.center {
            text-align: center;
        }

        table.data td.org-name,
        table.data td.name {
            font-weight: bold;
            color:
                {{ $colors['slate_900'] }}
            ;
            font-size: 10.5px;
        }

        table.data td.org-reg,
        table.data td.code {
            font-size: 8.5px;
            color:
                {{ $colors['slate_500'] }}
            ;
            font-weight: normal;
            display: block;
            margin-top: 2px;
        }

        table.data .empty-row td {
            text-align: center;
            padding: 14px;
            color:
                {{ $colors['slate_500'] }}
            ;
            font-style: italic;
            font-size: 9px;
        }

        /* ========== STATUS PILLS ========== */
        .pill {
            display: inline-block;
            padding: 3px 9px;
            border-radius: 9px;
            font-size: 8.5px;
            font-weight: bold;
            text-transform: capitalize;
            letter-spacing: 0.2px;
            background:
                {{ $colors['slate_200'] }}
            ;
            color:
                {{ $colors['slate_700'] }}
            ;
        }

        .pill-active,
        .pill-approved,
        .pill-open,
        .pill-completed,
        .pill-accepted,
        .pill-pwd,
        .pill-consent {
            background:
                {{ $colors['primary_soft'] }}
            ;
            color:
                {{ $colors['primary'] }}
            ;
        }

        .pill-pending,
        .pill-in_progress,
        .pill-in-progress {
            background: #FEF3C7;
            color: #92400E;
        }

        .pill-rejected,
        .pill-closed,
        .pill-declined,
        .pill-no-consent {
            background: #FFE4E6;
            color:
                {{ $colors['red_dark'] }}
            ;
        }

        .pill-suspended,
        .pill-inactive,
        .pill-unknown {
            background:
                {{ $colors['slate_200'] }}
            ;
            color:
                {{ $colors['slate_700'] }}
            ;
        }

        .pill-anon {
            background: #EDE9FE;
            color: #6D28D9;
        }

        /* ========== FIELD GRID (detail views) ========== */
        table.fields {
            width: 100%;
            border-collapse: collapse;
        }

        table.fields td {
            padding: 5px 0;
            vertical-align: top;
            width: 50%;
        }

        .field-label {
            display: block;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color:
                {{ $colors['slate_500'] }}
            ;
            margin-bottom: 1px;
        }

        .field-value {
            display: block;
            font-size: 10.5px;
            color:
                {{ $colors['slate_900'] }}
            ;
        }

        .field-value.muted {
            color:
                {{ $colors['slate_500'] }}
            ;
            font-style: italic;
        }

        /* ========== STATS ========== */
        table.stats {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }

        table.stats td {
            width: 33.33%;
            padding: 10px 12px;
            background:
                {{ $colors['slate_50'] }}
            ;
            border: 1px solid
                {{ $colors['slate_200'] }}
            ;
            vertical-align: top;
        }

        table.stats td:first-child {
            border-left: 3px solid
                {{ $colors['primary'] }}
            ;
        }

        table.stats .stat-label {
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color:
                {{ $colors['slate_500'] }}
            ;
        }

        table.stats .stat-value {
            font-size: 18px;
            font-weight: bold;
            color:
                {{ $colors['slate_900'] }}
            ;
            margin-top: 2px;
        }

        /* ========== YES / NO ========== */
        .yes {
            color:
                {{ $colors['primary'] }}
            ;
            font-weight: bold;
        }

        .no {
            color:
                {{ $colors['slate_500'] }}
            ;
        }

        /* ========== SERVICES / CHIPS ========== */
        .services {
            line-height: 1.9;
        }

        .service-chip {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 10px;
            background:
                {{ $colors['primary_soft'] }}
            ;
            color:
                {{ $colors['primary'] }}
            ;
            font-size: 9px;
            font-weight: bold;
            margin-right: 5px;
            margin-bottom: 4px;
            text-transform: capitalize;
        }

        /* ========== DESCRIPTION ========== */
        .description {
            padding: 10px 12px;
            background:
                {{ $colors['slate_50'] }}
            ;
            border-left: 3px solid
                {{ $colors['primary'] }}
            ;
            font-size: 10px;
            line-height: 1.6;
            color:
                {{ $colors['slate_700'] }}
            ;
        }

        /* ========== META BLOCK ========== */
        .meta-block {
            margin-top: 16px;
            padding-top: 10px;
            border-top: 1px dashed
                {{ $colors['slate_200'] }}
            ;
            font-size: 9px;
            color:
                {{ $colors['slate_500'] }}
            ;
        }

        .meta-block table {
            width: 100%;
            border-collapse: collapse;
        }

        .meta-block td {
            padding: 2px 0;
        }

        .meta-block td.right {
            text-align: right;
        }

        /* ========== EMPTY STATE ========== */
        .empty {
            padding: 40px 20px;
            text-align: center;
            color:
                {{ $colors['slate_500'] }}
            ;
            font-style: italic;
            font-size: 10.5px;
        }

        /* ========== PAGE BREAK ========== */
        .page-break {
            page-break-before: always;
        }
    </style>
</head>

<body>

    {{-- ================= HEADER ================= --}}
    <header>
        <div class="header-inner">
            <table>
                <tr>
                    <td class="logo">
                        @if (!empty($logoPath) && file_exists($logoPath))
                            <img src="{{ $logoPath }}" alt="{{ $brand['short_name'] ?? 'Logo' }}"
                                style="height:66px;width:auto;">
                        @endif
                    </td>
                    <td class="title">
                        <h1>{{ $brand['county'] }}</h1>
                        <div class="subtitle">
                            {{ $brand['tagline'] }}
                        </div>
                        <div class="meta">
                            Generated {{ $generatedAt->format('F j, Y \a\t g:i A') }}
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        <div class="header-rule"></div>
    </header>

    @yield('content')

    {{-- ================= FOOTER ================= --}}
    <footer>
        <table>
            <tr>
                <td>
                    <strong>{{ $brand['generated_by'] }}</strong>
                    &nbsp;&bull;&nbsp;
                    GBV Helpline: <strong>{{ $contacts['gbv_helpline'] }}</strong>
                    &nbsp;&bull;&nbsp;
                    Police: <strong>{{ $contacts['police'] }}</strong>
                    &nbsp;&bull;&nbsp;
                    Child: <strong>{{ $contacts['child_helpline'] }}</strong>
                </td>
                <td class="right">
                    <div class="confidential">{{ $brand['confidential'] }}</div>
                    <div class="pagenum" style="margin-top:3px;"></div>
                </td>
            </tr>
        </table>
    </footer>

</body>

</html>