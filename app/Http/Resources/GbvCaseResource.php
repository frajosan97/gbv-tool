<?php

namespace App\Http\Resources;

use App\Models\CaseNote;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class GbvCaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'case_number' => $this->case_number,
            'incident_number' => $this->incident_number,
            'incident_type' => $this->incidentType ? [
                'id' => $this->incidentType->id,
                'name' => $this->incidentType->name,
            ] : null,
            'incident_type_other' => $this->incident_type_other,
            'incident_date' => $this->incident_date?->toDateString(),
            'incident_time' => $this->incident_time,
            'incident_location' => $this->incident_location,
            'description' => $this->description,

            'reported_to_police' => (bool) $this->reported_to_police,
            'police_station' => $this->police_station,
            'ob_number' => $this->ob_number,
            'medical_attention' => (bool) $this->medical_attention,
            'health_facility' => $this->health_facility,

            'is_sensitive' => (bool) $this->is_sensitive,
            'consent_obtained' => (bool) $this->consent_obtained,
            'consent_details' => $this->consent_details,

            'status' => $this->status ? ['id' => $this->status->id, 'name' => $this->status->name] : null,
            'priority' => $this->priority ? ['id' => $this->priority->id, 'name' => $this->priority->name] : null,
            'confidentiality' => $this->confidentiality ? ['id' => $this->confidentiality->id, 'name' => $this->confidentiality->name] : null,
            'conclusion_type' => $this->conclusionType ? ['id' => $this->conclusionType->id, 'name' => $this->conclusionType->name] : null,
            'conclusion_notes' => $this->conclusion_notes,
            'concluded_at' => $this->concluded_at?->toIso8601String(),

            'partner' => $this->partner ? ['id' => $this->partner->id, 'name' => $this->partner->organization_name] : null,
            'survivor' => $this->survivor ? [
                'id' => $this->survivor->id,
                'unique_code' => $this->survivor->unique_code,
                'full_name' => $this->survivor->anonymous ? null : $this->survivor->full_name,
            ] : null,
            'primary_officer' => $this->primaryOfficer ? ['id' => $this->primaryOfficer->id, 'name' => $this->primaryOfficer->name] : null,
            'created_by' => $this->createdBy ? ['id' => $this->createdBy->id, 'name' => $this->createdBy->name] : null,
            'concluded_by' => $this->concludedBy ? ['id' => $this->concludedBy->id, 'name' => $this->concludedBy->name] : null,

            'county' => $this->county ? ['id' => $this->county->id, 'name' => $this->county->name] : null,
            'sub_county' => $this->subCounty ? ['id' => $this->subCounty->id, 'name' => $this->subCounty->name] : null,
            'ward' => $this->ward ? ['id' => $this->ward->id, 'name' => $this->ward->name] : null,
            'village' => $this->village ? ['id' => $this->village->id, 'name' => $this->village->name] : null,

            'files_count' => $this->whenCounted('caseFiles'),
            'referrals_count' => $this->whenCounted('referrals'),
            'perpetrators_count' => $this->whenCounted('perpetrators'),
            'notes_count' => $this->whenCounted('notes'),

            'files' => $this->whenLoaded('caseFiles', fn() => $this->caseFiles->map(fn($f) => [
                'id' => $f->id,
                'file_number' => $f->file_number,
                'title' => $f->title,
                'description' => $f->description,
                'file_name' => $f->file_name,
                'file_size' => $f->file_size,
                'mime_type' => $f->mime_type,
                'file_type' => $f->fileType?->name,
                'referral_id' => $f->referral_id,
                'url' => route('gbv-cases.files.download', [
                    'gbvCase' => $f->gbv_case_id,
                    'file' => $f->id,
                ]),
                'uploaded_by' => $f->createdBy?->name,
                'created_at' => $f->created_at?->toIso8601String(),
            ])),

            'perpetrators' => $this->whenLoaded('perpetrators', fn() => $this->perpetrators->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'name_known' => (bool) $p->name_known,
                'gender_option' => $p->genderOption
                    ? ['id' => $p->genderOption->id, 'name' => $p->genderOption->name]
                    : null,
                'age_range' => $p->ageRange
                    ? ['id' => $p->ageRange->id, 'name' => $p->ageRange->name]
                    : null,
                'relationship_option' => $p->relationshipOption
                    ? ['id' => $p->relationshipOption->id, 'name' => $p->relationshipOption->name]
                    : null,
                'relationship_details' => $p->relationship_details,
                'physical_description' => $p->physical_description,
                'identifying_features' => $p->identifying_features,
                'is_repeat_offender' => (bool) $p->is_repeat_offender,
                'previous_incidents_count' => (int) ($p->previous_incidents_count ?? 0),
                'additional_info' => $p->additional_info,
                'created_at' => $p->created_at?->toIso8601String(),
            ])),

            'referrals' => $this->whenLoaded('referrals', fn() => $this->referrals->map(fn($r) => [
                'id' => $r->id,
                'referral_number' => $r->referral_number,
                'referral_type' => $r->referralType
                    ? ['id' => $r->referralType->id, 'name' => $r->referralType->name]
                    : null,
                'urgency' => $r->urgency
                    ? ['id' => $r->urgency->id, 'name' => $r->urgency->name, 'color' => $r->urgency->color]
                    : null,
                'from_partner' => $r->fromPartner
                    ? ['id' => $r->fromPartner->id, 'name' => $r->fromPartner->organization_name]
                    : null,
                'to_partner' => $r->toPartner
                    ? ['id' => $r->toPartner->id, 'name' => $r->toPartner->organization_name]
                    : null,
                'case_file' => $r->caseFile
                    ? ['id' => $r->caseFile->id, 'title' => $r->caseFile->title]
                    : null,
                'reason' => $r->reason,
                'services_requested' => $r->services_requested,
                'status' => $r->status?->value,
                'accepted_at' => $r->accepted_at?->toIso8601String(),
                'completed_at' => $r->completed_at?->toIso8601String(),
                'feedback' => $r->feedback,
                'created_by' => $r->createdBy
                    ? ['id' => $r->createdBy->id, 'name' => $r->createdBy->name]
                    : null,
                'files' => $r->relationLoaded('files')
                    ? $r->files->map(fn($f) => [
                        'id' => $f->id,
                        'file_number' => $f->file_number,
                        'title' => $f->title,
                        'description' => $f->description,
                        'file_name' => $f->file_name,
                        'file_size' => $f->file_size,
                        'mime_type' => $f->mime_type,
                        'file_type' => $f->fileType?->name,
                        'referral_id' => $f->referral_id,
                        'url' => route('gbv-cases.files.download', [
                            'gbvCase' => $f->gbv_case_id,
                            'file' => $f->id,
                        ]),
                        'uploaded_by' => $f->createdBy?->name,
                        'created_at' => $f->created_at?->toIso8601String(),
                    ])
                    : [],
                'created_at' => $r->created_at?->toIso8601String(),
                'updated_at' => $r->updated_at?->toIso8601String(),
            ])),

            'notes' => $this->whenLoaded('notes', fn() => $this->mapVisibleNotes()),

            'timeline' => $this->whenLoaded('timelines', fn() => $this->buildTimeline()),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }

    /**
     * Serialize only the notes the current viewer is allowed to read.
     * Falls back to "public only" when there's no authenticated user
     * (console/queue contexts) — never leaks private content.
     */
    private function mapVisibleNotes(): array
    {
        $user = request()->user();

        return $this->notes
            ->filter(fn(CaseNote $n) => $user ? $user->can('view', $n) : !$n->is_private)
            ->map(fn(CaseNote $n) => [
                'id' => $n->id,
                'content' => $n->content,
                'author' => $n->createdBy?->name,
                'created_by' => $n->created_by,
                'note_type_id' => $n->note_type_id,
                'note_type' => $n->noteType ? [
                    'id' => $n->noteType->id,
                    'name' => $n->noteType->name,
                    'slug' => $n->noteType->slug,
                    'icon' => $n->noteType->icon,
                    'color' => $n->noteType->color,
                ] : null,
                'is_private' => (bool) $n->is_private,
                'is_important' => (bool) $n->is_important,
                'attachments' => $n->attachments,
                'metadata' => $n->metadata,
                'created_at' => $n->created_at?->toIso8601String(),
                'updated_at' => $n->updated_at?->toIso8601String(),
            ])
            ->values()
            ->all();
    }

    /**
     * Merge every activity source into a single sorted timeline.
     * Uses relationLoaded() guards so it's safe even when relations
     * weren't eager-loaded.
     */
    private function buildTimeline(): array
    {
        $events = collect();
        $user = request()->user();

        $events->push([
            'id' => "case-{$this->id}",
            'type' => 'case',
            'title' => 'Case opened',
            'actor' => $this->createdBy?->name,
            'timestamp' => $this->created_at?->toIso8601String(),
        ]);

        if ($this->relationLoaded('caseFiles')) {
            foreach ($this->caseFiles as $f) {
                $events->push([
                    'id' => "file-{$f->id}",
                    'type' => 'file',
                    'title' => 'File uploaded: ' . ($f->file_name ?? ''),
                    'actor' => $f->createdBy?->name,
                    'timestamp' => $f->created_at?->toIso8601String(),
                ]);
            }
        }

        if ($this->relationLoaded('perpetrators')) {
            foreach ($this->perpetrators as $p) {
                $label = $p->name
                    ?: ($p->name_known === false ? 'Unknown perpetrator' : 'Unnamed perpetrator');

                $events->push([
                    'id' => "perp-{$p->id}",
                    'type' => 'perpetrator',
                    'title' => "Perpetrator recorded: {$label}",
                    'actor' => $p->createdBy?->name,
                    'timestamp' => $p->created_at?->toIso8601String(),
                ]);
            }
        }

        if ($this->relationLoaded('referrals')) {
            foreach ($this->referrals as $r) {
                $events->push([
                    'id' => "ref-{$r->id}",
                    'type' => 'referral',
                    'title' => 'Referred to ' . ($r->toPartner?->organization_name ?? 'partner'),
                    'description' => $r->referralType?->name,
                    'actor' => $r->createdBy?->name,
                    'timestamp' => $r->created_at?->toIso8601String(),
                ]);

                if ($r->accepted_at) {
                    $events->push([
                        'id' => "ref-{$r->id}-accepted",
                        'type' => 'referral',
                        'title' => 'Referral accepted' . ($r->toPartner?->organization_name ? ' by ' . $r->toPartner->organization_name : ''),
                        'actor' => null,
                        'timestamp' => $r->accepted_at->toIso8601String(),
                    ]);
                }

                if ($r->completed_at) {
                    $events->push([
                        'id' => "ref-{$r->id}-completed",
                        'type' => 'referral',
                        'title' => 'Referral completed',
                        'actor' => null,
                        'timestamp' => $r->completed_at->toIso8601String(),
                    ]);
                }
            }
        }

        if ($this->relationLoaded('notes')) {
            foreach ($this->notes as $n) {
                // Never leak private note content into the timeline
                // if the viewer can't read the note itself.
                if ($user && !$user->can('view', $n)) {
                    continue;
                }
                if (!$user && $n->is_private) {
                    continue;
                }

                $events->push([
                    'id' => "note-{$n->id}",
                    'type' => 'note',
                    'title' => 'Note added'
                        . ($n->noteType?->name ? ': ' . $n->noteType->name : ''),
                    'description' => Str::limit($n->content ?? '', 120),
                    'actor' => $n->createdBy?->name,
                    'timestamp' => $n->created_at?->toIso8601String(),
                ]);
            }
        }

        if ($this->relationLoaded('timelines')) {
            foreach ($this->timelines as $t) {
                $events->push([
                    'id' => "tl-{$t->id}",
                    'type' => $t->type ?? 'status',
                    'title' => $t->title ?? 'Activity',
                    'description' => $t->description ?? null,
                    'actor' => $t->user?->name,
                    'timestamp' => $t->created_at?->toIso8601String(),
                ]);
            }
        }

        if ($this->concluded_at) {
            $events->push([
                'id' => "concl-{$this->id}",
                'type' => 'status',
                'title' => 'Case concluded' . ($this->conclusionType?->name ? ': ' . $this->conclusionType->name : ''),
                'actor' => $this->concludedBy?->name,
                'timestamp' => $this->concluded_at->toIso8601String(),
            ]);
        }

        return $events
            ->filter(fn($e) => !empty($e['timestamp']))
            ->sortByDesc('timestamp')
            ->values()
            ->all();
    }
}