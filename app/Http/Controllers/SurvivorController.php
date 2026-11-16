<?php

namespace App\Http\Controllers;

use App\Data\SurvivorFilters;
use App\Exports\SurvivorsExport;
use App\Http\Requests\StoreSurvivorRequest;
use App\Http\Requests\UpdateSurvivorRequest;
use App\Http\Resources\SurvivorResource;
use App\Models\AgeRange;
use App\Models\County;
use App\Models\GenderOption;
use App\Models\Survivor;
use App\Services\SurvivorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class SurvivorController extends Controller
{
    public function __construct(
        private readonly SurvivorService $survivors,
    ) {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Survivor::class);

        $user = $request->user();
        $filters = SurvivorFilters::fromRequest($request, SurvivorService::ALLOWED_SORTS);

        return Inertia::render('survivors/index', [
            'survivors' => $this->survivors->paginate($filters, $user),
            'filters' => $filters->toArray(),
            'lookups' => [
                'counties' => County::orderBy('name')->get(['id', 'name']),
                'genderOptions' => GenderOption::orderBy('name')->get(['id', 'name']),
                'ageRanges' => AgeRange::orderBy('min_age')->get(['id', 'name']),
            ],
            'can' => [
                'create' => $user->can('create', Survivor::class),
                'export' => $user->can('export', Survivor::class),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Survivor::class);

        return Inertia::render('survivors/create', [
            'can' => [
                'create' => $request->user()->can('create', Survivor::class),
            ],
        ]);
    }

    public function store(StoreSurvivorRequest $request): RedirectResponse
    {
        $survivor = $this->survivors->create($request->validated(), $request->user());

        return redirect()
            ->route('survivors.show', $survivor)
            ->with('success', 'Survivor registered successfully.');
    }

    public function show(Request $request, Survivor $survivor): Response
    {
        $this->authorize('view', $survivor);

        $survivor = $this->survivors->findForShow($survivor);
        $user = $request->user();

        return Inertia::render('survivors/show', [
            'survivor' => (new SurvivorResource($survivor))->resolve(),
            'can' => [
                'update' => $user->can('update', $survivor),
                'delete' => $user->can('delete', $survivor),
                'restore' => $user->can('restore', $survivor),
                'print' => $user->can('print', $survivor),
                'export' => $user->can('export', Survivor::class),
            ],
        ]);
    }

    public function edit(Request $request, Survivor $survivor): Response
    {
        $this->authorize('update', $survivor);

        $survivor = $this->survivors->findForShow($survivor);
        $user = $request->user();

        return Inertia::render('survivors/edit', [
            'survivor' => (new SurvivorResource($survivor))->resolve(),
            'can' => [
                'update' => $user->can('update', $survivor),
                'delete' => $user->can('delete', $survivor),
                'print' => $user->can('print', $survivor),
            ],
        ]);
    }

    public function update(UpdateSurvivorRequest $request, Survivor $survivor): RedirectResponse
    {
        $this->survivors->update($survivor, $request->validated(), $request->user());

        return redirect()
            ->route('survivors.show', $survivor)
            ->with('success', 'Survivor updated successfully.');
    }

    public function destroy(Survivor $survivor): RedirectResponse
    {
        $this->authorize('delete', $survivor);

        $this->survivors->delete($survivor);

        return redirect()
            ->route('survivors.index')
            ->with('success', 'Survivor deleted.');
    }

    public function restore(Survivor $survivor): RedirectResponse
    {
        $this->authorize('restore', $survivor);

        $this->survivors->restore($survivor);

        return back()->with('success', 'Survivor restored.');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $this->authorize('export', Survivor::class);

        $filters = SurvivorFilters::fromRequest($request, SurvivorService::ALLOWED_SORTS);

        return Excel::download(
            new SurvivorsExport($this->survivors->exportQuery($filters, $request->user())),
            'survivors-' . now()->format('Y-m-d') . '.xlsx',
        );
    }

    public function exportPdf(Request $request): HttpResponse
    {
        $this->authorize('export', Survivor::class);

        $filters = SurvivorFilters::fromRequest($request, SurvivorService::ALLOWED_SORTS);

        return $this->survivors->renderListPdf($filters, $request->user());
    }

    public function print(Survivor $survivor): HttpResponse
    {
        $this->authorize('print', $survivor);

        return $this->survivors->renderSurvivorPdf($survivor);
    }

    public function printCard(Survivor $survivor): HttpResponse
    {
        $this->authorize('print', $survivor);

        return $this->survivors->renderSurvivorCardPdf($survivor);
    }
}