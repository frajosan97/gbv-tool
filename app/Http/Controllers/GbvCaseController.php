<?php

namespace App\Http\Controllers;

use App\Data\GbvCaseFilters;
use App\Exports\GbvCasesExport;
use App\Http\Requests\StoreGbvCaseRequest;
use App\Http\Requests\UpdateGbvCaseRequest;
use App\Http\Resources\GbvCaseResource;
use App\Models\CaseNote;
use App\Models\CaseStatusOption;
use App\Models\ConclusionType;
use App\Models\ConfidentialityLevel;
use App\Models\County;
use App\Models\GbvCase;
use App\Models\IncidentType;
use App\Models\NoteType;
use App\Models\PriorityLevel;
use App\Models\Survivor;
use App\Models\User;
use App\Services\GbvCaseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class GbvCaseController extends Controller
{
    public function __construct(
        private readonly GbvCaseService $cases,
    ) {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', GbvCase::class);

        $user = $request->user();
        $filters = GbvCaseFilters::fromRequest($request, GbvCaseService::ALLOWED_SORTS);

        return Inertia::render('gbv-cases/index', [
            'cases' => $this->cases->paginate($filters, $user),
            'filters' => $filters->toArray(),
            'lookups' => [
                'incidentTypes' => IncidentType::orderBy('name')->get(['id', 'name']),
                'caseStatuses' => CaseStatusOption::orderBy('name')->get(['id', 'name']),
                'priorityLevels' => PriorityLevel::orderBy('name')->get(['id', 'name']),
                'confidentialityLevels' => ConfidentialityLevel::orderBy('name')->get(['id', 'name']),
                'counties' => County::orderBy('name')->get(['id', 'name']),
            ],
            'can' => [
                'create' => $user->can('create', GbvCase::class),
                'export' => $user->can('export', GbvCase::class),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', GbvCase::class);

        $user = $request->user();

        return Inertia::render('gbv-cases/create', [
            'lookups' => [
                'incidentTypes' => IncidentType::orderBy('name')->get(['id', 'name']),
                'caseStatuses' => CaseStatusOption::orderBy('name')->get(['id', 'name']),
                'priorityLevels' => PriorityLevel::orderBy('name')->get(['id', 'name']),
                'confidentialityLevels' => ConfidentialityLevel::orderBy('name')->get(['id', 'name']),
                'counties' => County::orderBy('name')->get(['id', 'name']),
                'survivors' => $this->survivorOptions($user),
            ],
            'can' => [
                'create' => $user->can('create', GbvCase::class),
            ],
        ]);
    }

    public function store(StoreGbvCaseRequest $request): RedirectResponse
    {
        $case = $this->cases->create($request->validated(), $request->user());

        return redirect()
            ->route('gbv-cases.show', $case)
            ->with('success', 'GBV case registered successfully.');
    }

    public function show(Request $request, GbvCase $gbvCase): Response
    {
        $this->authorize('view', $gbvCase);

        $user = $request->user();
        $gbvCase = $this->cases->findForShow($gbvCase);

        return Inertia::render('gbv-cases/show', [
            'case' => (new GbvCaseResource($gbvCase))->resolve(),
            'can' => [
                'update' => $user->can('update', $gbvCase),
                'delete' => $user->can('delete', $gbvCase),
                'restore' => $user->can('restore', $gbvCase),
                'print' => $user->can('print', $gbvCase),
                'conclude' => $user->can('conclude', $gbvCase),
                'export' => $user->can('export', GbvCase::class),

                // ---- Notes ----
                'createNote' => $user->can('create', [CaseNote::class, $gbvCase]),
                'viewPrivateNotes' => $user->isSuperAdmin() || $user->can('view private case notes'),
            ],
        ]);
    }

    public function edit(Request $request, GbvCase $gbvCase): Response
    {
        $this->authorize('update', $gbvCase);

        $user = $request->user();
        $gbvCase = $this->cases->findForShow($gbvCase);

        return Inertia::render('gbv-cases/edit', [
            'case' => (new GbvCaseResource($gbvCase))->resolve(),
            'lookups' => [
                'incidentTypes' => IncidentType::orderBy('name')->get(['id', 'name']),
                'caseStatuses' => CaseStatusOption::orderBy('name')->get(['id', 'name']),
                'priorityLevels' => PriorityLevel::orderBy('name')->get(['id', 'name']),
                'confidentialityLevels' => ConfidentialityLevel::orderBy('name')->get(['id', 'name']),
                'counties' => County::orderBy('name')->get(['id', 'name']),
                'conclusionTypes' => ConclusionType::orderBy('name')->get(['id', 'name']),
                'survivors' => $this->survivorOptions(
                    $user,
                    (int) $gbvCase->survivor_id,
                ),
            ],
            'can' => [
                'update' => $user->can('update', $gbvCase),
                'delete' => $user->can('delete', $gbvCase),
                'print' => $user->can('print', $gbvCase),
                'conclude' => $user->can('conclude', $gbvCase),
            ],
        ]);
    }

    public function update(UpdateGbvCaseRequest $request, GbvCase $gbvCase): RedirectResponse
    {
        $this->cases->update($gbvCase, $request->validated(), $request->user());

        return redirect()
            ->route('gbv-cases.show', $gbvCase)
            ->with('success', 'GBV case updated successfully.');
    }

    public function conclude(Request $request, GbvCase $gbvCase): RedirectResponse
    {
        $this->authorize('conclude', $gbvCase);

        $data = $request->validate([
            'conclusion_type_id' => ['required', 'integer', 'exists:conclusion_types,id'],
            'conclusion_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $this->cases->conclude($gbvCase, $data, $request->user());

        return redirect()
            ->route('gbv-cases.show', $gbvCase)
            ->with('success', 'Case concluded.');
    }

    public function destroy(Request $request, GbvCase $gbvCase): RedirectResponse
    {
        $this->authorize('delete', $gbvCase);

        $this->cases->delete($gbvCase, $request->user());

        return redirect()
            ->route('gbv-cases.index')
            ->with('success', 'GBV case deleted.');
    }

    public function restore(Request $request, GbvCase $gbvCase): RedirectResponse
    {
        $this->authorize('restore', $gbvCase);

        $this->cases->restore($gbvCase, $request->user());

        return back()->with('success', 'GBV case restored.');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $this->authorize('export', GbvCase::class);

        $filters = GbvCaseFilters::fromRequest($request, GbvCaseService::ALLOWED_SORTS);

        return Excel::download(
            new GbvCasesExport($this->cases->exportQuery($filters, $request->user())),
            'gbv-cases-' . now()->format('Y-m-d') . '.xlsx',
        );
    }

    public function exportPdf(Request $request): HttpResponse
    {
        $this->authorize('export', GbvCase::class);

        $filters = GbvCaseFilters::fromRequest($request, GbvCaseService::ALLOWED_SORTS);

        return $this->cases->renderListPdf($filters, $request->user());
    }

    public function print(GbvCase $gbvCase): HttpResponse
    {
        $this->authorize('print', $gbvCase);

        return $this->cases->renderCasePdf($gbvCase);
    }

    private function survivorOptions(User $user, ?int $includeId = null): array
    {
        return Survivor::query()
            ->attachableTo($user)
            ->when($includeId, fn($q) => $q->orWhereKey($includeId))
            ->orderBy('full_name')
            ->limit(500)
            ->get(['id', 'unique_code', 'full_name', 'anonymous'])
            ->map(function (\stdClass $s) {
                return [
                    'id' => (int) $s->id,
                    'name' => $s->anonymous ? 'Anonymous survivor' : ($s->full_name ?: $s->unique_code),
                    'label' => $s->anonymous
                        ? "Anonymous survivor · {$s->unique_code}"
                        : trim("{$s->full_name} · {$s->unique_code}", ' ·'),
                ];
            })
            ->values()
            ->all();
    }
}