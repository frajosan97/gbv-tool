@extends('layouts.pdf')

@section('title', $survivor->unique_code . ' — Survivor Record')

@push('styles')
    <style>
        /* Prevent long case numbers from wrapping mid-token */
        .data td.case-number {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: monospace;
            font-size: 11px;
        }

        /* Keep pills tidy and stop any model/JSON overflow */
        .pill {
            display: inline-block;
            white-space: nowrap;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: middle;
        }
    </style>
@endpush

@section('content')

    {{-- =========================================================== --}}
    {{-- PAGE 1: Survivor summary --}}
    {{-- =========================================================== --}}

    @php
        $displayName = $survivor->anonymous
            ? 'Anonymous survivor'
            : ($survivor->full_name ?: $survivor->unique_code);

        $locationParts = array_filter([
            $survivor->village?->name,
            $survivor->ward?->name,
            $survivor->subCounty?->name,
            $survivor->county?->name,
        ]);

        $ageDisplay = $survivor->age ?: ($survivor->ageRange?->name ?? '—');
    @endphp

    <div class="hero">
        <div class="org-name">{{ $displayName }}</div>
        <div class="sub-line">
            {{ $survivor->unique_code }}
            @if ($survivor->genderOption?->name)
                &nbsp;&bull;&nbsp; {{ $survivor->genderOption->name }}
            @endif
            @if ($ageDisplay !== '—')
                &nbsp;&bull;&nbsp; {{ $ageDisplay }}{{ $survivor->age ? ' yrs' : '' }}
            @endif
            @if (!empty($locationParts))
                &nbsp;&bull;&nbsp; {{ implode(', ', $locationParts) }}
            @endif
        </div>
        <div class="badges">
            @if ($survivor->anonymous)
                <span class="badge badge-suspended">Anonymous</span>
            @endif
            @if ($survivor->is_pwd)
                <span class="badge badge-verified">PWD</span>
            @endif
            @if ($survivor->consent_given)
                <span class="badge badge-approved">Consent Given</span>
            @else
                <span class="badge badge-rejected">No Consent</span>
            @endif
        </div>
    </div>

    <table class="stats">
        <tr>
            <td>
                <div class="stat-label">GBV Cases</div>
                <div class="stat-value">{{ $survivor->gbv_cases_count ?? 0 }}</div>
            </td>
            <td>
                <div class="stat-label">Age</div>
                <div class="stat-value">{{ $ageDisplay }}</div>
            </td>
            <td>
                <div class="stat-label">Registered</div>
                <div class="stat-value" style="font-size:12px;">
                    {{ $survivor->created_at?->format('M j, Y') ?? '—' }}
                </div>
            </td>
        </tr>
    </table>

    <div class="section">
        <div class="section-title">Identity &amp; Demographics</div>
        <table class="fields">
            <tr>
                <td>
                    <span class="field-label">Unique Code</span>
                    <span class="field-value">{{ $survivor->unique_code }}</span>
                </td>
                <td>
                    <span class="field-label">Full Name</span>
                    <span class="field-value {{ $survivor->anonymous || !$survivor->full_name ? 'muted' : '' }}">
                        {{ $survivor->anonymous ? 'Hidden — anonymous record' : ($survivor->full_name ?? '—') }}
                    </span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="field-label">Gender</span>
                    <span class="field-value {{ $survivor->genderOption?->name ? '' : 'muted' }}">
                        {{ $survivor->genderOption?->name ?? '—' }}
                    </span>
                </td>
                <td>
                    <span class="field-label">Date of Birth</span>
                    <span class="field-value {{ $survivor->dob ? '' : 'muted' }}">
                        {{ $survivor->dob?->format('d/m/Y') ?? '—' }}
                    </span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="field-label">Age</span>
                    <span class="field-value {{ $ageDisplay !== '—' ? '' : 'muted' }}">
                        {{ $ageDisplay }}
                    </span>
                </td>
                <td>
                    <span class="field-label">Document Type</span>
                    <span class="field-value {{ $survivor->idType?->name ? '' : 'muted' }}">
                        {{ $survivor->idType?->name ?? '—' }}
                    </span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <span class="field-label">Document Number</span>
                    <span class="field-value {{ $survivor->anonymous || !$survivor->id_number ? 'muted' : '' }}">
                        {{ $survivor->anonymous ? 'Hidden — anonymous record' : ($survivor->id_number ?? '—') }}
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Contact</div>
        <table class="fields">
            <tr>
                <td>
                    <span class="field-label">Primary Phone</span>
                    <span class="field-value {{ $survivor->anonymous || !$survivor->phone ? 'muted' : '' }}">
                        {{ $survivor->anonymous ? 'Hidden' : ($survivor->phone ?? '—') }}
                    </span>
                </td>
                <td>
                    <span class="field-label">Alternate Phone</span>
                    <span class="field-value {{ $survivor->anonymous || !$survivor->alternate_phone ? 'muted' : '' }}">
                        {{ $survivor->anonymous ? 'Hidden' : ($survivor->alternate_phone ?? '—') }}
                    </span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="field-label">Emergency Contact</span>
                    <span
                        class="field-value {{ $survivor->anonymous || !$survivor->emergency_contact_name ? 'muted' : '' }}">
                        {{ $survivor->anonymous ? 'Hidden' : ($survivor->emergency_contact_name ?? '—') }}
                    </span>
                </td>
                <td>
                    <span class="field-label">Emergency Phone</span>
                    <span
                        class="field-value {{ $survivor->anonymous || !$survivor->emergency_contact_phone ? 'muted' : '' }}">
                        {{ $survivor->anonymous ? 'Hidden' : ($survivor->emergency_contact_phone ?? '—') }}
                    </span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <span class="field-label">Relationship</span>
                    <span class="field-value {{ $survivor->emergencyContactRelationship?->name ? '' : 'muted' }}">
                        {{ $survivor->emergencyContactRelationship?->name ?? '—' }}
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Location</div>
        <table class="fields">
            <tr>
                <td>
                    <span class="field-label">County</span>
                    <span class="field-value {{ $survivor->county?->name ? '' : 'muted' }}">
                        {{ $survivor->county?->name ?? '—' }}
                    </span>
                </td>
                <td>
                    <span class="field-label">Sub-County</span>
                    <span class="field-value {{ $survivor->subCounty?->name ? '' : 'muted' }}">
                        {{ $survivor->subCounty?->name ?? '—' }}
                    </span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="field-label">Ward</span>
                    <span class="field-value {{ $survivor->ward?->name ? '' : 'muted' }}">
                        {{ $survivor->ward?->name ?? '—' }}
                    </span>
                </td>
                <td>
                    <span class="field-label">Village</span>
                    <span class="field-value {{ $survivor->village?->name ? '' : 'muted' }}">
                        {{ $survivor->village?->name ?? '—' }}
                    </span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <span class="field-label">Landmark</span>
                    <span class="field-value {{ $survivor->landmark ? '' : 'muted' }}">
                        {{ $survivor->landmark ?? '—' }}
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Disability</div>
        <table class="fields">
            <tr>
                <td>
                    <span class="field-label">Person with Disability</span>
                    <span class="field-value">
                        @if ($survivor->is_pwd)
                            <span class="pill pill-pwd">Yes</span>
                        @else
                            No
                        @endif
                    </span>
                </td>
                <td>
                    <span class="field-label">Disability Type</span>
                    <span class="field-value {{ $survivor->disabilityType?->name ? '' : 'muted' }}">
                        {{ $survivor->disabilityType?->name ?? '—' }}
                    </span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <span class="field-label">PWD Registration No.</span>
                    <span class="field-value {{ $survivor->pwd_registration_number ? '' : 'muted' }}">
                        {{ $survivor->pwd_registration_number ?? '—' }}
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Consent &amp; Case</div>
        <table class="fields">
            <tr>
                <td>
                    <span class="field-label">Consent</span>
                    <span class="field-value">
                        @if ($survivor->consent_given)
                            <span class="pill pill-consent">Given</span>
                        @else
                            <span class="pill pill-no-consent">Not given</span>
                        @endif
                    </span>
                </td>
                <td>
                    <span class="field-label">Consent Date</span>
                    <span class="field-value {{ $survivor->consent_given_at ? '' : 'muted' }}">
                        {{ $survivor->consent_given_at?->format('d/m/Y H:i') ?? '—' }}
                    </span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="field-label">GBV Cases</span>
                    <span class="field-value">{{ $survivor->gbv_cases_count ?? 0 }}</span>
                </td>
                <td>
                    <span class="field-label">Partner</span>
                    <span class="field-value {{ $survivor->partner?->organization_name ? '' : 'muted' }}">
                        {{ $survivor->partner?->organization_name ?? '—' }}
                    </span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="field-label">Registered By</span>
                    <span class="field-value {{ $survivor->createdBy?->name ? '' : 'muted' }}">
                        {{ $survivor->createdBy?->name ?? '—' }}
                    </span>
                </td>
                <td>
                    <span class="field-label">Registered At</span>
                    <span class="field-value">
                        {{ $survivor->created_at?->format('d/m/Y H:i') ?? '—' }}
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <div class="meta-block">
        <table>
            <tr>
                <td>
                    <strong>Unique Code:</strong>
                    {{ $survivor->unique_code }}
                </td>
                <td class="right">
                    <strong>Last Updated:</strong>
                    {{ $survivor->updated_at?->format('F j, Y \a\t g:i A') ?? '—' }}
                </td>
            </tr>
        </table>
    </div>

    {{-- =========================================================== --}}
    {{-- PAGE 2+: Related cases --}}
    {{-- =========================================================== --}}

    @if ($survivor->relationLoaded('gbvCases') && $survivor->gbvCases->count() > 0)
        <div class="page-break"></div>

        <div class="section">
            <div class="section-title">
                GBV Cases Linked
                <span class="count">{{ $survivor->gbvCases->count() }} shown</span>
            </div>
            <table class="data">
                <thead>
                    <tr>
                        <th style="width:8%">#</th>
                        <th style="width:32%">Case No.</th>
                        <th style="width:20%">Status</th>
                        <th style="width:20%">Opened</th>
                        <th style="width:20%; text-align:right">Updated</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($survivor->gbvCases as $i => $c)
                        @php
                            // $c->status is a related model (CaseStatus), not a string.
                            $statusSlug = $c->status?->slug ?? 'unknown';
                            $statusName = $c->status?->name ?? '—';
                            $statusColor = $c->status?->color ?? null;
                            $statusKey = strtolower(str_replace('_', '-', $statusSlug));
                        @endphp
                        <tr>
                            <td class="center">{{ $i + 1 }}</td>
                            <td class="case-number">{{ $c->case_number ?? '#' . $c->id }}</td>
                            <td>
                                <span class="pill pill-{{ $statusKey }}{{ $statusColor ? ' pill-' . $statusColor : '' }}">
                                    {{ $statusName }}
                                </span>
                            </td>
                            <td>{{ $c->created_at?->format('M j, Y') ?? '—' }}</td>
                            <td class="right">{{ $c->updated_at?->format('M j, Y') ?? '—' }}</td>
                        </tr>
                    @empty
                        <tr class="empty-row">
                            <td colspan="5">No cases linked to this survivor.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    @endif

@endsection