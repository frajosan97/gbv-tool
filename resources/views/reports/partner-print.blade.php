@extends('layouts.pdf')

@section('title', $partner->organization_name . ' — Partner Profile')

@section('content')

    {{-- =========================================================== --}}
    {{-- PAGE 1: Profile summary --}}
    {{-- =========================================================== --}}

    <div class="hero">
        <div class="org-name">{{ $partner->organization_name }}</div>
        <div class="sub-line">
            @if ($partner->organizationType?->name)
                {{ $partner->organizationType->name }}
            @endif
            @if ($partner->registration_number)
                &nbsp;&bull;&nbsp; Reg: {{ $partner->registration_number }}
            @endif
            @if ($partner->year_established)
                &nbsp;&bull;&nbsp; Est. {{ $partner->year_established }}
            @endif
        </div>
        <div class="badges">
            <span class="badge badge-{{ $partner->status ?? 'suspended' }}">
                {{ ucfirst($partner->status ?? 'Unknown') }}
            </span>
            @if ($partner->verified_at)
                <span class="badge badge-verified">Verified</span>
            @else
                <span class="badge badge-unverified">Not Verified</span>
            @endif
        </div>
    </div>

    <table class="stats">
        <tr>
            <td>
                <div class="stat-label">Users</div>
                <div class="stat-value">{{ $partner->users_count }}</div>
            </td>
            <td>
                <div class="stat-label">Survivors</div>
                <div class="stat-value">{{ $partner->survivors_count }}</div>
            </td>
            <td>
                <div class="stat-label">GBV Cases</div>
                <div class="stat-value">{{ $partner->gbv_cases_count }}</div>
            </td>
        </tr>
    </table>

    <div class="section">
        <div class="section-title">Contact Information</div>
        <table class="fields">
            <tr>
                <td>
                    <span class="field-label">Contact Person</span>
                    <span class="field-value {{ $partner->contact_person ? '' : 'muted' }}">
                        {{ $partner->contact_person ?? 'Not provided' }}
                    </span>
                </td>
                <td>
                    <span class="field-label">Email Address</span>
                    <span class="field-value {{ $partner->email ? '' : 'muted' }}">
                        {{ $partner->email ?? 'Not provided' }}
                    </span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="field-label">Phone</span>
                    <span class="field-value {{ $partner->phone ? '' : 'muted' }}">
                        {{ $partner->phone ?? 'Not provided' }}
                    </span>
                </td>
                <td>
                    <span class="field-label">Alternate Phone</span>
                    <span class="field-value {{ $partner->alternate_phone ? '' : 'muted' }}">
                        {{ $partner->alternate_phone ?? 'Not provided' }}
                    </span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <span class="field-label">Website</span>
                    <span class="field-value {{ $partner->website ? '' : 'muted' }}">
                        {{ $partner->website ?? 'Not provided' }}
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
                    <span class="field-value {{ $partner->county?->name ? '' : 'muted' }}">
                        {{ $partner->county?->name ?? '—' }}
                    </span>
                </td>
                <td>
                    <span class="field-label">Sub-County</span>
                    <span class="field-value {{ $partner->subCounty?->name ? '' : 'muted' }}">
                        {{ $partner->subCounty?->name ?? '—' }}
                    </span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="field-label">Ward</span>
                    <span class="field-value {{ $partner->ward?->name ? '' : 'muted' }}">
                        {{ $partner->ward?->name ?? '—' }}
                    </span>
                </td>
                <td>
                    <span class="field-label">Village</span>
                    <span class="field-value {{ $partner->village?->name ? '' : 'muted' }}">
                        {{ $partner->village?->name ?? '—' }}
                    </span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="field-label">Address</span>
                    <span class="field-value {{ $partner->address ? '' : 'muted' }}">
                        {{ $partner->address ?? '—' }}
                    </span>
                </td>
                <td>
                    <span class="field-label">City / Postal</span>
                    @php
                        $cityPostal = trim(($partner->city ?? '') . ' ' . ($partner->postal_code ?? ''));
                    @endphp
                    <span class="field-value {{ $cityPostal ? '' : 'muted' }}">
                        {{ $cityPostal ?: '—' }}
                    </span>
                </td>
            </tr>
        </table>
    </div>

    @if (!empty($partner->services_offered))
        <div class="section">
            <div class="section-title">Services Offered</div>
            <div class="services">
                @foreach ($partner->services_offered as $service)
                    <span class="service-chip">{{ $service }}</span>
                @endforeach
            </div>
        </div>
    @endif

    @if (!empty($partner->description))
        <div class="section">
            <div class="section-title">Description</div>
            <div class="description">{{ $partner->description }}</div>
        </div>
    @endif

    <div class="meta-block">
        <table>
            <tr>
                <td>
                    <strong>Registered:</strong>
                    {{ $partner->created_at?->format('F j, Y') ?? '—' }}
                </td>
                <td class="right">
                    <strong>Last verified:</strong>
                    {{ $partner->verified_at?->format('F j, Y \a\t g:i A') ?? 'Never' }}
                </td>
            </tr>
        </table>
    </div>

    {{-- =========================================================== --}}
    {{-- PAGE 2+: Related records --}}
    {{-- =========================================================== --}}

    <div class="page-break"></div>

    {{-- ================= USERS ================= --}}
    <div class="section">
        <div class="section-title">
            Users Attached
            <span class="count">{{ $partner->users->count() }} shown</span>
        </div>
        <table class="data">
            <thead>
                <tr>
                    <th style="width:35%">Name</th>
                    <th style="width:35%">Email</th>
                    <th style="width:20%">Phone</th>
                    <th style="width:10%; text-align:right">Joined</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($partner->users as $u)
                    <tr>
                        <td>{{ $u->name }}</td>
                        <td>{{ $u->email ?? '—' }}</td>
                        <td>{{ $u->phone ?? '—' }}</td>
                        <td class="right">{{ $u->created_at?->format('M j, Y') ?? '—' }}</td>
                    </tr>
                @empty
                    <tr class="empty-row">
                        <td colspan="4">No users attached to this partner.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- ================= SURVIVORS ================= --}}
    <div class="section">
        <div class="section-title">
            Survivors
            <span class="count">{{ $partner->survivors->count() }} shown</span>
        </div>
        <table class="data">
            <thead>
                <tr>
                    <th style="width:8%">#</th>
                    <th style="width:42%">Name</th>
                    <th style="width:20%">Status</th>
                    <th style="width:30%; text-align:right">Registered</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($partner->survivors as $i => $s)
                    @php
                        $statusKey = strtolower($s->status?->name ?? 'unknown');
                    @endphp
                    <tr>
                        <td class="center">{{ $i + 1 }}</td>
                        <td>
                            {{ $s->full_name ?? $s->name ?? 'Survivor #' . $s->id }}
                        </td>
                        <td>
                            <span class="pill pill-{{ $statusKey }}">
                                {{ $s->status?->name ?? '—' }}
                            </span>
                        </td>
                        <td class="right">{{ $s->created_at?->format('M j, Y') ?? '—' }}</td>
                    </tr>
                @empty
                    <tr class="empty-row">
                        <td colspan="4">No survivors registered with this partner.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- ================= GBV CASES ================= --}}
    <div class="section">
        <div class="section-title">
            GBV Cases Created
            <span class="count">{{ $partner->gbvCases->count() }} shown</span>
        </div>
        <table class="data">
            <thead>
                <tr>
                    <th style="width:8%">#</th>
                    <th style="width:30%">Case No.</th>
                    <th style="width:30%">Status</th>
                    <th style="width:32%; text-align:right">Opened</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($partner->gbvCases as $i => $c)
                    @php
                        $statusKey = strtolower(str_replace('_', '-', $c->status?->name ?? 'unknown'));
                    @endphp
                    <tr>
                        <td class="center">{{ $i + 1 }}</td>
                        <td>{{ $c->case_number ?? '#' . $c->id }}</td>
                        <td>
                            <span class="pill pill-{{ $statusKey }}">
                                {{ $c->status?->name ?? '—' }}
                            </span>
                        </td>
                        <td class="right">{{ $c->created_at?->format('M j, Y') ?? '—' }}</td>
                    </tr>
                @empty
                    <tr class="empty-row">
                        <td colspan="4">No cases created by this partner.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- ================= REFERRALS OUT ================= --}}
    <div class="section">
        <div class="section-title">
            Referrals Sent
            <span class="count">{{ $partner->outgoingReferrals->count() }} shown</span>
        </div>
        <table class="data">
            <thead>
                <tr>
                    <th style="width:8%">#</th>
                    <th style="width:42%">Referred To</th>
                    <th style="width:20%">Status</th>
                    <th style="width:30%; text-align:right">Sent</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($partner->outgoingReferrals as $i => $r)
                    @php
                        // Assumes $r->status is cast to App\Enums\ReferralStatus
                        $statusValue = $r->status instanceof \App\Enums\ReferralStatus
                            ? $r->status->value
                            : ($r->status ?? 'unknown');
                        $statusLabel = $r->status instanceof \App\Enums\ReferralStatus
                            ? $r->status->label()
                            : ucfirst($r->status ?? '—');
                        $statusKey = strtolower(str_replace('_', '-', $statusValue));
                    @endphp
                    <tr>
                        <td class="center">{{ $i + 1 }}</td>
                        <td>{{ $r->toPartner?->organization_name ?? 'Unknown partner' }}</td>
                        <td>
                            <span class="pill pill-{{ $statusKey }}">
                                {{ $statusLabel }}
                            </span>
                        </td>
                        <td class="right">{{ $r->created_at?->format('M j, Y') ?? '—' }}</td>
                    </tr>
                @empty
                    <tr class="empty-row">
                        <td colspan="4">No referrals sent by this partner.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- ================= REFERRALS IN ================= --}}
    <div class="section">
        <div class="section-title">
            Referrals Received
            <span class="count">{{ $partner->incomingReferrals->count() }} shown</span>
        </div>
        <table class="data">
            <thead>
                <tr>
                    <th style="width:8%">#</th>
                    <th style="width:42%">Referred From</th>
                    <th style="width:20%">Status</th>
                    <th style="width:30%; text-align:right">Received</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($partner->incomingReferrals as $i => $r)
                    @php
                        // Assumes $r->status is cast to App\Enums\ReferralStatus
                        $statusValue = $r->status instanceof \App\Enums\ReferralStatus
                            ? $r->status->value
                            : ($r->status ?? 'unknown');
                        $statusLabel = $r->status instanceof \App\Enums\ReferralStatus
                            ? $r->status->label()
                            : ucfirst($r->status ?? '—');
                        $statusKey = strtolower(str_replace('_', '-', $statusValue));
                    @endphp
                    <tr>
                        <td class="center">{{ $i + 1 }}</td>
                        <td>{{ $r->fromPartner?->organization_name ?? 'Unknown partner' }}</td>
                        <td>
                            <span class="pill pill-{{ $statusKey }}">
                                {{ $statusLabel }}
                            </span>
                        </td>
                        <td class="right">{{ $r->created_at?->format('M j, Y') ?? '—' }}</td>
                    </tr>
                @empty
                    <tr class="empty-row">
                        <td colspan="4">No referrals received by this partner.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

@endsection