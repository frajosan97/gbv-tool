@extends('layouts.pdf')

@section('title', 'GBV Case ' . $case->case_number)

@section('content')
    @php
        use Illuminate\Support\Str;

        // ---- Normalize relations once ----
        $files = $case->caseFiles ?? collect();
        $perpetrators = $case->perpetrators ?? collect();
        $referrals = $case->referrals ?? collect();
        $notes = $case->notes ?? collect();
        $explicitTimeline = $case->timelines ?? collect();

        // ---- Formatting helpers ----
        $fmtDate = fn($d) => $d?->format('d/m/Y') ?? '—';
        $fmtDateTime = fn($d) => $d?->format('d/m/Y H:i') ?? '—';

        $fmtPerpName = fn($p) => $p->name
            ?: ($p->name_known === false ? 'Unknown perpetrator' : 'Unnamed perpetrator');

        $fmtPerpRelationship = fn($p) => $p->relationship_option?->name
            ?: $p->relationship_details
            ?: '—';

        $sectionTitleStyle = 'margin:16px 0 6px;font-size:12px;font-weight:700;page-break-after:avoid;';
    @endphp

    {{-- ============================================================ --}}
    {{-- Header --}}
    {{-- ============================================================ --}}
    <div class="section-header" style="page-break-inside:avoid;">
        <h2>Case {{ $case->case_number }}</h2>
        <div class="section-meta">
            Incident {{ $case->incident_number ?? '—' }}
            &nbsp;&bull;&nbsp;
            {{ $case->incident_date?->format('F j, Y') ?? '—' }}
            @if ($case->is_sensitive)
                &nbsp;&bull;&nbsp; <strong>SENSITIVE</strong>
            @endif
        </div>
    </div>

    {{-- ============================================================ --}}
    {{-- Case summary --}}
    {{-- ============================================================ --}}
    <table class="data" style="margin-bottom:16px;page-break-inside:avoid;">
        <tbody>
            <tr>
                <th style="width:22%">Survivor</th>
                <td>
                    {{ $case->survivor?->full_name ?? '—' }}
                    <span class="code">{{ $case->survivor?->unique_code }}</span>
                </td>
                <th style="width:22%">Primary officer</th>
                <td>{{ $case->primaryOfficer?->name ?? '—' }}</td>
            </tr>
            <tr>
                <th>Incident type</th>
                <td>{{ $case->incidentType?->name ?? $case->incident_type_other ?? '—' }}</td>
                <th>Status</th>
                <td>{{ $case->status?->name ?? '—' }}</td>
            </tr>
            <tr>
                <th>Priority</th>
                <td>{{ $case->priority?->name ?? '—' }}</td>
                <th>Confidentiality</th>
                <td>{{ $case->confidentiality?->name ?? '—' }}</td>
            </tr>
            <tr>
                <th>Location</th>
                <td colspan="3">
                    {{ implode(', ', array_filter([
        $case->village?->name,
        $case->ward?->name,
        $case->subCounty?->name,
        $case->county?->name,
    ])) ?: '—' }}
                    @if ($case->incident_location)
                        — {{ $case->incident_location }}
                    @endif
                </td>
            </tr>
            <tr>
                <th>Police</th>
                <td>
                    {{ $case->reported_to_police ? 'Reported' : 'Not reported' }}
                    {{ $case->police_station ? ' · ' . $case->police_station : '' }}
                    {{ $case->ob_number ? ' · OB ' . $case->ob_number : '' }}
                </td>
                <th>Medical</th>
                <td>
                    {{ $case->medical_attention ? 'Yes' : 'No' }}
                    {{ $case->health_facility ? ' · ' . $case->health_facility : '' }}
                </td>
            </tr>
            <tr>
                <th>Consent</th>
                <td>{{ $case->consent_obtained ? 'Obtained' : 'Not obtained' }}</td>
                <th>Concluded</th>
                <td>
                    {{ $case->concluded_at?->format('d/m/Y H:i') ?? '—' }}
                    {{ $case->conclusionType?->name ? ' · ' . $case->conclusionType->name : '' }}
                </td>
            </tr>
        </tbody>
    </table>

    {{-- ============================================================ --}}
    {{-- Description & conclusion --}}
    {{-- ============================================================ --}}
    <h3 style="{{ $sectionTitleStyle }}">Description</h3>
    <p style="font-size:11px;line-height:1.55;">{{ $case->description ?: '—' }}</p>

    @if ($case->conclusion_notes)
        <h3 style="{{ $sectionTitleStyle }}">Conclusion notes</h3>
        <p style="font-size:11px;line-height:1.55;">{{ $case->conclusion_notes }}</p>
    @endif

    {{-- ============================================================ --}}
    {{-- Perpetrators --}}
    {{-- ============================================================ --}}
    @if ($perpetrators->isNotEmpty())
        <h3 style="{{ $sectionTitleStyle }}">
            Perpetrators ({{ $perpetrators->count() }})
        </h3>
        <table class="data">
            <thead>
                <tr>
                    <th style="width:5%">#</th>
                    <th style="width:30%">Name</th>
                    <th style="width:20%">Relationship</th>
                    <th style="width:15%">Gender</th>
                    <th style="width:15%">Age range</th>
                    <th style="width:15%">Repeat offender</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($perpetrators as $i => $p)
                    <tr style="page-break-inside:avoid;">
                        <td class="center">{{ $i + 1 }}</td>
                        <td>{{ $fmtPerpName($p) }}</td>
                        <td>{{ $fmtPerpRelationship($p) }}</td>
                        <td class="center">{{ $p->gender_option?->name ?? '—' }}</td>
                        <td class="center">{{ $p->age_range?->name ?? '—' }}</td>
                        <td class="center">
                            {{ $p->is_repeat_offender ? 'Yes' : 'No' }}
                            @if ($p->is_repeat_offender && $p->previous_incidents_count)
                                ({{ $p->previous_incidents_count }})
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    {{-- ============================================================ --}}
    {{-- Referrals --}}
    {{-- ============================================================ --}}
    @if ($referrals->isNotEmpty())
        <h3 style="{{ $sectionTitleStyle }}">
            Referrals ({{ $referrals->count() }})
        </h3>
        <table class="data">
            <thead>
                <tr>
                    <th style="width:5%">#</th>
                    <th style="width:22%">To partner</th>
                    <th style="width:18%">Type</th>
                    <th style="width:12%">Urgency</th>
                    <th style="width:13%">Status</th>
                    <th style="width:15%">Referred at</th>
                    <th style="width:15%">Completed</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($referrals as $i => $r)
                    <tr style="page-break-inside:avoid;">
                        <td class="center">{{ $i + 1 }}</td>
                        <td>{{ $r->toPartner?->organization_name ?? '—' }}</td>
                        <td>{{ $r->referralType?->name ?? '—' }}</td>
                        <td class="center">{{ $r->urgency?->name ?? '—' }}</td>
                        <td class="center">{{ ucfirst($r->status?->value ?? '—') }}</td>
                        <td class="center">{{ $fmtDate($r->created_at) }}</td>
                        <td class="center">{{ $fmtDate($r->completed_at) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    {{-- ============================================================ --}}
    {{-- Notes --}}
    {{-- ============================================================ --}}
    @if ($notes->isNotEmpty())
        <h3 style="{{ $sectionTitleStyle }}">
            Notes ({{ $notes->count() }})
        </h3>
        <table class="data">
            <thead>
                <tr>
                    <th style="width:5%">#</th>
                    <th style="width:15%">Type</th>
                    <th style="width:48%">Note</th>
                    <th style="width:17%">Author</th>
                    <th style="width:15%">Date</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($notes as $i => $n)
                    <tr style="page-break-inside:avoid;">
                        <td class="center">{{ $i + 1 }}</td>
                        <td class="center">
                            {{ $n->noteType?->name ?? '—' }}
                            @if ($n->is_important)
                                <span style="color:#b45309;font-weight:600;">★</span>
                            @endif
                        </td>
                        <td>{{ Str::limit((string) ($n->content ?? ''), 220, '…') ?: '—' }}</td>
                        <td>{{ $n->createdBy?->name ?? '—' }}</td>
                        <td class="center">{{ $fmtDate($n->created_at) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    {{-- ============================================================ --}}
    {{-- Timeline --}}
    {{-- ============================================================ --}}
    @php
        $timeline = collect();
        $seen = [];

        $push = function (string $key, array $event) use (&$timeline, &$seen) {
            if (isset($seen[$key])) {
                return;
            }
            $seen[$key] = true;
            $timeline->push($event);
        };

        // 1) Case opened
        $push("case-{$case->id}", [
            'timestamp' => $case->created_at,
            'type' => 'case',
            'title' => 'Case opened',
            'description' => null,
            'actor' => $case->createdBy?->name,
        ]);

        // 2) Explicit timeline entries
        foreach ($explicitTimeline as $t) {
            $push("tl-{$t->id}", [
                'timestamp' => $t->created_at,
                'type' => $t->type ?? 'status',
                'title' => $t->title ?? 'Activity',
                'description' => $t->description ?? null,
                'actor' => $t->user?->name,
            ]);
        }

        // 3) Derived entries
        foreach ($files as $f) {
            $push("file-{$f->id}", [
                'timestamp' => $f->created_at,
                'type' => 'file',
                'title' => 'File uploaded: ' . ($f->file_name ?? ''),
                'description' => null,
                'actor' => $f->createdBy?->name,
            ]);
        }
        foreach ($perpetrators as $p) {
            $push("perp-{$p->id}", [
                'timestamp' => $p->created_at,
                'type' => 'perpetrator',
                'title' => 'Perpetrator recorded: ' . $fmtPerpName($p),
                'description' => null,
                'actor' => null,
            ]);
        }
        foreach ($referrals as $r) {
            $push("ref-{$r->id}", [
                'timestamp' => $r->created_at,
                'type' => 'referral',
                'title' => 'Referred to ' . ($r->toPartner?->organization_name ?? 'partner'),
                'description' => $r->referralType?->name,
                'actor' => $r->createdBy?->name,
            ]);

            if ($r->accepted_at) {
                $push("ref-{$r->id}-accepted", [
                    'timestamp' => $r->accepted_at,
                    'type' => 'referral',
                    'title' => 'Referral accepted'
                        . ($r->toPartner?->organization_name ? ' by ' . $r->toPartner->organization_name : ''),
                    'description' => null,
                    'actor' => null,
                ]);
            }

            if ($r->completed_at) {
                $push("ref-{$r->id}-completed", [
                    'timestamp' => $r->completed_at,
                    'type' => 'referral',
                    'title' => 'Referral completed',
                    'description' => null,
                    'actor' => null,
                ]);
            }
        }
        foreach ($notes as $n) {
            $push("note-{$n->id}", [
                'timestamp' => $n->created_at,
                'type' => 'note',
                'title' => 'Note added'
                    . ($n->noteType?->name ? ': ' . $n->noteType->name : ''),
                'description' => Str::limit((string) ($n->content ?? ''), 100, '…'),
                'actor' => $n->createdBy?->name,
            ]);
        }

        // 4) Concluded
        if ($case->concluded_at) {
            $push("concl-{$case->id}", [
                'timestamp' => $case->concluded_at,
                'type' => 'status',
                'title' => 'Case concluded'
                    . ($case->conclusionType?->name ? ': ' . $case->conclusionType->name : ''),
                'description' => null,
                'actor' => $case->concludedBy?->name,
            ]);
        }

        $timeline = $timeline
            ->filter(fn($e) => !is_null($e['timestamp']))
            ->sortByDesc('timestamp')
            ->values();
    @endphp

    @if ($timeline->isNotEmpty())
        <h3 style="{{ $sectionTitleStyle }}">
            Timeline ({{ $timeline->count() }})
        </h3>
        <table class="data">
            <thead>
                <tr>
                    <th style="width:5%">#</th>
                    <th style="width:18%">When</th>
                    <th style="width:15%">Type</th>
                    <th style="width:42%">Event</th>
                    <th style="width:20%">Actor</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($timeline as $i => $event)
                    <tr style="page-break-inside:avoid;">
                        <td class="center">{{ $i + 1 }}</td>
                        <td class="center">{{ $fmtDateTime($event['timestamp']) }}</td>
                        <td class="center">{{ ucfirst($event['type']) }}</td>
                        <td>
                            {{ $event['title'] }}
                            @if (!empty($event['description']))
                                <span style="color:#555;font-size:10px;">
                                    — {{ $event['description'] }}
                                </span>
                            @endif
                        </td>
                        <td>{{ $event['actor'] ?? '—' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
@endsection