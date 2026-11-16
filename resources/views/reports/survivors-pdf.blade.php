@extends('layouts.pdf')

@section('title', 'Survivors Report — ' . ($brand['short_name'] ?? $brand['name']))

@push('styles')

@endpush

@section('content')
    {{-- ================= SECTION HEADING ================= --}}
    <div class="section-header">
        <h2>Registered Survivors</h2>
        <div class="section-meta">
            {{ $survivors->count() }} {{ Str::plural('survivor', $survivors->count()) }} listed
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
                <th style="width:22%">Survivor</th>
                <th style="width:9%">Gender</th>
                <th style="width:7%">Age</th>
                <th style="width:18%">Location</th>
                <th style="width:10%">Document</th>
                <th style="width:8%; text-align:center">PWD</th>
                <th style="width:9%; text-align:center">Consent</th>
                <th style="width:6%; text-align:right">Cases</th>
                <th style="width:7%">Registered</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($survivors as $i => $s)
                @php
                    $displayName = $s->anonymous
                        ? 'Anonymous survivor'
                        : ($s->full_name ?: $s->unique_code);

                    $locationParts = array_filter([
                        $s->village?->name,
                        $s->ward?->name,
                        $s->subCounty?->name,
                        $s->county?->name,
                    ]);

                    $ageDisplay = $s->age ?: ($s->ageRange?->name ?? '—');

                    $documentDisplay = $s->idType?->name
                        ? $s->idType->name . ($s->anonymous ? '' : ($s->id_number ? ' · ' . $s->id_number : ''))
                        : '—';
                @endphp
                <tr>
                    <td class="center">{{ $i + 1 }}</td>

                    <td>
                        <span class="name">
                            {{ $displayName }}
                            @if ($s->anonymous)
                                <span class="pill pill-anon" style="margin-left:4px;">Anon</span>
                            @endif
                        </span>
                        <span class="code">{{ $s->unique_code }}</span>
                    </td>

                    <td>{{ $s->genderOption?->name ?? '—' }}</td>

                    <td>{{ $ageDisplay }}</td>

                    <td class="location">
                        @if (!empty($locationParts))
                            {{ implode(', ', $locationParts) }}
                        @else
                            —
                        @endif
                    </td>

                    <td>
                        {{ $s->anonymous ? '—' : $documentDisplay }}
                    </td>

                    <td class="center">
                        @if ($s->is_pwd)
                            <span class="pill pill-pwd">PWD</span>
                        @else
                            <span class="no">—</span>
                        @endif
                    </td>

                    <td class="center">
                        @if ($s->consent_given)
                            <span class="pill pill-consent">Given</span>
                        @else
                            <span class="pill pill-no-consent">None</span>
                        @endif
                    </td>

                    <td class="num">{{ $s->gbv_cases_count ?? 0 }}</td>

                    <td>{{ $s->created_at?->format('d/m/Y') ?? '—' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="10" class="empty">
                        No survivors match the current filters.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>
@endsection