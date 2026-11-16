<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>ID Card - {{ $survivor->unique_code }}</title>
    <style>
        @page { margin: 0; size: 242pt 153pt; }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 8px;
            color: #1e293b;
            width: 242pt; height: 153pt;
            position: relative; overflow: hidden;
            background-color: #ffffff;
            
            /* SECURITY PATTERN: Micro-dot matrix with diagonal gradients */
            background-image: 
                radial-gradient(circle, #065f46 1px, transparent 1px),
                repeating-linear-gradient(45deg, rgba(6, 95, 70, 0.03) 0, rgba(6, 95, 70, 0.03) 1px, transparent 1px, transparent 10px);
            background-size: 8px 8px, 100% 100%;
        }

        /* SECURITY FEATURE: Faint Diagonal Security Ribbon */
        .security-ribbon {
            position: absolute;
            top: 50%; left: -20%;
            width: 150%; height: 25px;
            background: rgba(6, 95, 70, 0.04);
            transform: translateY(-50%) rotate(-35deg);
            z-index: 0;
            pointer-events: none;
            border-top: 1px dashed rgba(6, 95, 70, 0.1);
            border-bottom: 1px dashed rgba(6, 95, 70, 0.1);
        }

        /* Faint Watermark Text */
        .watermark {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-15deg);
            font-size: 44px; font-weight: 900;
            color: #065f46; opacity: 0.03;
            white-space: nowrap; z-index: 0;
            text-transform: uppercase; letter-spacing: 5px;
        }

        /* Double Security Border */
        .card-border-outer {
            position: absolute; top: 2px; bottom: 2px; left: 2px; right: 2px;
            border: 1.5px solid #0f172a;
            border-radius: 6px; z-index: 10; pointer-events: none;
        }
        .card-border-inner {
            position: absolute; top: 5px; bottom: 5px; left: 5px; right: 5px;
            border: 0.5px solid #94a3b8;
            border-radius: 4px; z-index: 10; pointer-events: none;
        }

        /* Top Header */
        .header-bar {
            position: absolute; top: 6px; left: 6px; right: 6px;
            background: #065f46;
            color: #ffffff;
            padding: 6px 12px; height: 40px;
            border-radius: 4px 4px 0 0;
            z-index: 5;
        }
        .header-bar table { width: 100%; border-collapse: collapse; }
        .header-bar td { vertical-align: middle; }

        .logo {
            height: 26px; width: auto;
            background: #ffffff; border-radius: 2px; padding: 1px;
        }
        
        .header-text { padding-left: 10px; }
        
        .title-main { 
            font-size: 9.5px; 
            font-weight: bold; 
            letter-spacing: 0.5px; 
            text-transform: uppercase;
            white-space: nowrap; 
        }
        .title-sub { 
            font-size: 6px; 
            opacity: 0.8; 
            letter-spacing: 0.5px;
            white-space: nowrap; 
        }
        
        .confidential-badge {
            border: 1px solid #fca5a5; color: #fecaca;
            padding: 2px 5px; border-radius: 3px;
            font-size: 5.5px; font-weight: bold; letter-spacing: 1px;
            display: inline-block; margin-top: 2px;
            white-space: nowrap;
        }

        /* Body Layout */
        .body-wrap {
            position: absolute; top: 48px; left: 6px; right: 6px;
            padding: 10px 12px; height: 75px;
            z-index: 5; 
        }
        .body-wrap table { width: 100%; border-collapse: collapse; }
        .body-wrap td { vertical-align: top; }

        /* Data Fields */
        .label {
            font-size: 5.5px; text-transform: uppercase; letter-spacing: 0.5px;
            color: #475569; margin-top: 8px; 
        }
        .label:first-child { margin-top: 0; }
        
        .value { font-size: 10px; font-weight: bold; color: #0f172a; margin-top: 1px; }
        
        .value-code {
            font-family: 'DejaVu Sans Mono', monospace;
            font-size: 14px; font-weight: bold;
            color: #065f46; letter-spacing: 1px; margin-top: 1px;
            /* White background to ensure the code is readable over the pattern */
            background: #ffffff; 
            display: inline-block;
            padding: 1px 6px;
            border-radius: 2px;
            border: 1px solid #cbd5e1;
        }

        /* Side-by-side layout for Dates */
        .split-table { width: 100%; margin-top: 6px; border-collapse: collapse; }
        .split-table td { padding: 0; vertical-align: top; width: 50%; }

        /* QR Container */
        .qr-container {
            width: 72px; height: 72px;
            display: block; margin: 0 auto;
            position: relative;
            margin-top: 4px;
        }
        .qr-img {
            width: 100%; height: 100%;
            object-fit: contain; position: relative; z-index: 1;
            background: #ffffff;
            padding: 3px;
            border-radius: 3px;
            border: 1px solid #cbd5e1;
        }

        /* Clean Footer */
        .footer-bar {
            position: absolute; bottom: 6px; left: 6px; right: 6px;
            background: #f8fafc;
            border-top: 1px solid #cbd5e1;
            border-radius: 0 0 4px 4px;
            padding: 4px 10px; height: 18px;
            z-index: 5;
            font-size: 5.5px;
            color: #475569;
            text-align: center;
            line-height: 1.2;
        }
        .hotline { color: #dc2626; font-weight: bold; }
    </style>
</head>
<body>
    @php
        $displayName = $survivor->anonymous ? 'ANONYMOUS SURVIVOR' : strtoupper($survivor->full_name ?: 'UNKNOWN NAME');
        
        $issueDate = $survivor->created_at ? \Carbon\Carbon::parse($survivor->created_at) : now();
        $expiryDate = $issueDate->copy()->addYear();

        $issueStr = $issueDate->format('d M Y');
        $expiryStr = $expiryDate->format('d M Y');

        $qrDataUri = null;
        if (class_exists(\BaconQrCode\Renderer\GDLibRenderer::class)) {
            try {
                $renderer = new \BaconQrCode\Renderer\GDLibRenderer(200, 1, 'png');
                $writer = new \BaconQrCode\Writer($renderer);
                $png = $writer->writeString($survivor->unique_code);
                $qrDataUri = 'data:image/png;base64,' . base64_encode($png);
            } catch (\Throwable $e) {}
        }
    @endphp

    {{-- Security Background Elements --}}
    <div class="security-ribbon"></div>
    <div class="watermark">{{ $brand['short_name'] ?? 'OFFICIAL' }}</div>
    
    <div class="card-border-outer"></div>
    <div class="card-border-inner"></div>

    {{-- HEADER --}}
    <div class="header-bar">
        <table>
            <tr>
                <td style="width: 40px;">
                    @if (!empty($brand['logo']) && file_exists(public_path($brand['logo'])))
                        <img class="logo" src="{{ public_path($brand['logo']) }}" alt="Logo">
                    @endif
                </td>
                <td class="header-text">
                    <div class="title-main">Survivor Service Card</div>
                    <div class="title-sub">{{ strtoupper($brand['name'] ?? 'GBV RESPONSE') }}</div>
                </td>
                <td style="text-align: right; width: 60px;">
                    <div class="confidential-badge">RESTRICTED</div>
                </td>
            </tr>
        </table>
    </div>

    {{-- BODY --}}
    <div class="body-wrap">
        <table>
            <tr>
                <td style="width: 68%; padding-right: 10px;">
                    <div class="label">Survivor Code</div>
                    <div class="value-code">{{ $survivor->unique_code }}</div>

                    <div class="label">Name</div>
                    <div class="value">{{ $displayName }}</div>

                    <table class="split-table">
                        <tr>
                            <td>
                                <div class="label">Issue Date</div>
                                <div class="value" style="font-size: 8px;">{{ $issueStr }}</div>
                            </td>
                            <td>
                                <div class="label">Valid Until</div>
                                <div class="value" style="font-size: 8px;">{{ $expiryStr }}</div>
                            </td>
                        </tr>
                    </table>
                </td>

                <td style="width: 32%; vertical-align: middle;">
                    <div class="qr-container">
                        @if ($qrDataUri)
                            <img class="qr-img" src="{{ $qrDataUri }}" alt="QR">
                        @endif
                    </div>
                </td>
            </tr>
        </table>
    </div>

    {{-- CLEAN FOOTER --}}
    <div class="footer-bar">
        If found, drop at nearest Police Station or call Helpline.<br>
        <span class="hotline">GBV {{ $contacts['gbv_helpline'] }}</span> 
        &nbsp;•&nbsp; Police {{ $contacts['police'] }} 
        &nbsp;•&nbsp; Child {{ $contacts['child_helpline'] }}
    </div>
</body>
</html>