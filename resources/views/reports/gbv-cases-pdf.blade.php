@extends('layouts.pdf')

@section('title', 'GBV Cases Report — ' . ($brand['short_name'] ?? $brand['name']))

@section('content')
    <div class="section-header">
        <h2>GBV Case Register</h2>
        <div class="section-meta">
            {{ $cases->count() }} {{ Str::plural('case', $cases->count()) }} listed
            @if (!empty($filterSummary))
                &nbsp;&bull;&nbsp; Filtered by: {{ $filterSummary }}
            @endif
        </div>
    </div>

    <table class="data">
        <thead>
            <tr>
                <th style="width:4%">#</th>
                <th style="width:18%">Case</th>
                <th style="width:16%">Incident</th>
                <th style="width:10%">Date</th>
                <th style="width:16%">Location</th>
                <th style="width:10%">Status</th>
                <th style="width:10%">Priority</th>
                <th style="width:8%; text-align:center">Police</th>
                <th style="width:8%; text-align:center">Sensitive</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($cases as $i => $c)
                @php
                    $locations = array_filter([
                        $c->village?->name,
                        $c->ward?->name,
                        $c->subCounty?->name,
                        $c->county?->name,
                    ]);
                @endphp
                <tr>
                    <td class="center">{{ $i + 1 }}</td>

                    <td>
                        <span class="name">{{ $c->case_number }}</span>
                        <span class="code">{{ $c->incident_number ?? '—' }}</span>
                        @if ($c->survivor)
                            <span class="code">
                                · {{ $c->survivor->full_name ?? $c->survivor->unique_code }}
                            </span>
                        @endif
                    </td>

                    <td>{{ $c->incidentType?->name ?? $c->incident_type_other ?? '—' }}</td>

                    <td>{{ $c->incident_date?->format('d/m/Y') ?? '—' }}</td>

                    <td class="location">
                        {{ !empty($locations) ? implode(', ', $locations) : '—' }}
                    </td>

                    <td>{{ $c->status?->name ?? '—' }}</td>
                    <td>{{ $c->priority?->name ?? '—' }}</td>

                    <td class="center">
                        @if ($c->reported_to_police)
                            <span class="pill pill-consent">Yes</span>
                        @else
                            <span class="no">—</span>
                        @endif
                    </td>

                    <td class="center">
                        @if ($c->is_sensitive)
                            <span class="pill pill-anon">Sensitive</span>
                        @else
                            <span class="no">—</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="empty">
                        No GBV cases match the current filters.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>
@endsection