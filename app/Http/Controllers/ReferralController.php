<?php

namespace App\Http\Controllers;

use App\Enums\ReferralStatus;
use App\Http\Requests\StoreReferralRequest;
use App\Http\Requests\UpdateReferralRequest;
use App\Http\Resources\ReferralResource;
use App\Models\GbvCase;
use App\Models\Referral;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReferralController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* Index — partner inbox                                              */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): Response
    {
        $user = $request->user();
        $partnerId = $user->partner_id;

        $this->authorize('viewAny', Referral::class);

        $filters = [
            'search' => (string) $request->string('search', ''),
            'status' => (string) $request->string('status', ''),
            'urgency' => (string) $request->string('urgency', ''),
            'sort' => (string) $request->string('sort', 'created_at'),
            'dir' => $request->string('dir', 'desc')->toString() === 'asc' ? 'asc' : 'desc',
            'per_page' => (int) $request->integer('per_page', 15),
        ];

        $allowedSorts = ['created_at', 'updated_at', 'status', 'accepted_at', 'completed_at'];
        if (!in_array($filters['sort'], $allowedSorts, true)) {
            $filters['sort'] = 'created_at';
        }

        $baseQuery = Referral::query()
            ->with([
                'gbvCase:id,case_number,incident_number',
                'referralType:id,name',
                'urgency:id,name,color',
                'fromPartner:id,organization_name',
                'toPartner:id,organization_name',
                'createdBy:id,name',
            ])
            ->withCount(['updates']);

        // Scope: partners see their inbox; admins without a partner see all.
        if ($partnerId) {
            $baseQuery->where('to_partner_id', $partnerId);
        } elseif (!$user->isSuperAdmin() && !$user->can('manage gbv cases')) {
            $baseQuery->whereRaw('1 = 0');
        }

        // Apply filters
        $filtered = (clone $baseQuery)
            ->when($filters['status'] !== '', fn($q) => $q->where('status', $filters['status']))
            ->when($filters['urgency'] !== '', fn($q) => $q->where('urgency_option_id', (int) $filters['urgency']))
            ->when($filters['search'] !== '', function ($q) use ($filters) {
                $term = '%' . $filters['search'] . '%';
                $q->where(function ($sub) use ($term) {
                    $sub->where('referral_number', 'like', $term)
                        ->orWhere('reason', 'like', $term)
                        ->orWhereHas('gbvCase', fn($c) => $c
                            ->where('case_number', 'like', $term)
                            ->orWhere('incident_number', 'like', $term))
                        ->orWhereHas('fromPartner', fn($p) => $p
                            ->where('organization_name', 'like', $term));
                });
            })
            ->orderBy($filters['sort'], $filters['dir']);

        $paginator = $filtered
            ->paginate($filters['per_page'])
            ->withQueryString();

        // Counts — computed once against the base (partner-scoped) query.
        $counts = [
            'pending' => (clone $baseQuery)->where('status', ReferralStatus::Pending->value)->count(),
            'accepted' => (clone $baseQuery)->where('status', ReferralStatus::Accepted->value)->count(),
            'completed' => (clone $baseQuery)->where('status', ReferralStatus::Completed->value)->count(),
            'declined' => (clone $baseQuery)->where('status', ReferralStatus::Declined->value)->count(),
            'total' => (clone $baseQuery)->count(),
        ];

        return Inertia::render('referrals/index', [
            'referrals' => $paginator->through(
                fn(Referral $r) => (new ReferralResource($r))->resolve()
            ),
            'filters' => $filters,
            'counts' => $counts,
            'can' => [
                'update' => $user->can('create', Referral::class),
                'delete' => false,
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Show — single referral (deep link)                                 */
    /* ------------------------------------------------------------------ */

    public function show(Request $request, Referral $referral): Response
    {
        $this->authorize('view', $referral);

        $referral->load([
            'gbvCase:id,case_number,incident_number',
            'referralType:id,name',
            'urgency:id,name,color',
            'fromPartner:id,organization_name',
            'toPartner:id,organization_name',
            'caseFile:id,title',
            'createdBy:id,name',
        ]);

        return Inertia::render('referrals/show', [
            'referral' => (new ReferralResource($referral))->resolve(),
            'can' => [
                'update' => $request->user()->can('update', $referral),
                'delete' => false,
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Store — create a referral on a case                                */
    /* ------------------------------------------------------------------ */

    public function store(StoreReferralRequest $request, GbvCase $gbvCase): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($gbvCase, $data, $request) {
            $referral = $gbvCase->referrals()->create([
                'referral_number' => $this->nextReferralNumber($gbvCase),
                'from_partner_id' => $gbvCase->partner_id,   // may be null
                'to_partner_id' => $data['to_partner_id'],
                'created_by' => $request->user()->id,
                'referral_type_id' => $data['referral_type_id'],
                'urgency_option_id' => $data['urgency_option_id'],
                'case_file_id' => $data['case_file_id'] ?? null,
                'reason' => $data['reason'],
                'services_requested' => $data['services_requested'] ?? null,
                'status' => $data['status'],
                'feedback' => $data['feedback'] ?? null,
            ]);

            $this->stampStatusTimestamps($referral);
            $referral->save();
        });

        return back()->with('success', 'Referral created.');
    }

    /* ------------------------------------------------------------------ */
    /* Update — status + feedback for receivers, full payload for owners  */
    /* ------------------------------------------------------------------ */

    public function update(
        UpdateReferralRequest $request,
        GbvCase $gbvCase,
        Referral $referral,
    ): RedirectResponse {
        abort_unless($referral->gbv_case_id === $gbvCase->id, 404);

        $data = $request->validated();
        $receivingPartner = $this->isReceivingPartner($request->user(), $referral);

        DB::transaction(function () use ($referral, $data, $receivingPartner) {
            if ($receivingPartner) {
                $referral->fill([
                    'status' => $data['status'],
                    'feedback' => $data['feedback'] ?? null,
                ]);
            } else {
                $referral->fill([
                    'to_partner_id' => $data['to_partner_id'],
                    'referral_type_id' => $data['referral_type_id'],
                    'urgency_option_id' => $data['urgency_option_id'],
                    'case_file_id' => $data['case_file_id'] ?? null,
                    'reason' => $data['reason'],
                    'services_requested' => $data['services_requested'] ?? null,
                    'status' => $data['status'],
                    'feedback' => $data['feedback'] ?? null,
                ]);
            }

            $this->stampStatusTimestamps($referral);
            $referral->save();
        });

        return back()->with('success', 'Referral updated.');
    }

    /* ------------------------------------------------------------------ */
    /* Destroy — referrals are permanent, no destroy action               */
    /* ------------------------------------------------------------------ */

    public function destroy(GbvCase $gbvCase, Referral $referral): RedirectResponse
    {
        abort_unless($referral->gbv_case_id === $gbvCase->id, 404);

        $this->authorize('delete', $referral);

        $referral->delete();

        return back()->with('success', 'Referral deleted.');
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                             */
    /* ------------------------------------------------------------------ */

    private function nextReferralNumber(GbvCase $case): string
    {
        GbvCase::query()->whereKey($case->id)->lockForUpdate()->first();

        $prefix = 'REF-' . $case->case_number . '-';

        $last = Referral::withTrashed()
            ->where('gbv_case_id', $case->id)
            ->where('referral_number', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->value('referral_number');

        $next = $last ? ((int) substr($last, strlen($prefix))) + 1 : 1;

        return $prefix . str_pad((string) $next, 3, '0', STR_PAD_LEFT);
    }

    private function stampStatusTimestamps(Referral $referral): void
    {
        if (
            $referral->status === ReferralStatus::Accepted
            && $referral->accepted_at === null
        ) {
            $referral->accepted_at = Carbon::now();
        }

        if (
            $referral->status === ReferralStatus::Completed
            && $referral->completed_at === null
        ) {
            $referral->completed_at = Carbon::now();
        }

        if ($referral->status !== ReferralStatus::Completed) {
            $referral->completed_at = null;
        }
    }

    private function isReceivingPartner(?object $user, Referral $referral): bool
    {
        if (!$user || !$user->partner_id || !$referral->to_partner_id) {
            return false;
        }

        if ((int) $user->partner_id !== (int) $referral->to_partner_id) {
            return false;
        }

        if (
            $referral->from_partner_id
            && (int) $user->partner_id === (int) $referral->from_partner_id
        ) {
            return false;
        }

        return true;
    }
}