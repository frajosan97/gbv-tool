@extends('layouts.pdf')

@section('title', 'Partners Report — ' . ($brand['short_name'] ?? $brand['name']))

@push('styles')

@endpush

@section('content')
    {{-- ================= SECTION HEADING ================= --}}
    <div class="section-header">
        <h2>Partner Organizations</h2>
        <div class="section-meta">
            {{ $partners->count() }} {{ Str::plural('organization', $partners->count()) }} listed
            @if (!empty($filterSummary))
                &nbsp;&bull;&nbsp; Filtered by: {{ $filterSummary }}
            @endif
        </div>
    </div>

    {{-- ================= DATA TABLE ================= --}}
    <table class="data">
        <thead>
            <tr>
                <th style="width:4%">#</th>
                <th style="width:28%">Organization</th>
                <th style="width:14%">Type</th>
                <th style="width:12%">County</th>
                <th style="width:10%">Status</th>
                <th style="width:8%">Verified</th>
                <th style="width:8%; text-align:right">Users</th>
                <th style="width:8%; text-align:right">Survivors</th>
                <th style="width:8%; text-align:right">Cases</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($partners as $i => $p)
                @php
                    $statusKey = strtolower($p->status ?? 'unknown');
                    $statusClass = in_array($statusKey, ['active', 'pending', 'suspended', 'inactive'], true)
                        ? "pill-{$statusKey}"
                        : 'pill-unknown';
                @endphp
                <tr>
                    <td class="center">{{ $i + 1 }}</td>
                    <td>
                        <span class="org-name">{{ $p->organization_name }}</span>
                        @if ($p->registration_number)
                            <span class="org-reg">Reg: {{ $p->registration_number }}</span>
                        @endif
                    </td>
                    <td>{{ $p->organizationType?->name ?? '—' }}</td>
                    <td>{{ $p->county?->name ?? '—' }}</td>
                    <td>
                        <span class="pill {{ $statusClass }}">
                            {{ $p->status ?? 'Unknown' }}
                        </span>
                    </td>
                    <td>
                        @if ($p->verified_at)
                            <span class="yes">Yes</span>
                        @else
                            <span class="no">No</span>
                        @endif
                    </td>
                    <td class="num">{{ $p->users_count }}</td>
                    <td class="num">{{ $p->survivors_count }}</td>
                    <td class="num">{{ $p->gbv_cases_count }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="empty">
                        No partners match the current filters.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>
@endsection