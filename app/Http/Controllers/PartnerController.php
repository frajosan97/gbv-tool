<?php

namespace App\Http\Controllers;

use App\Data\PartnerFilters;
use App\Exports\PartnersExport;
use App\Http\Resources\PartnerResource;
use App\Models\County;
use App\Models\OrganizationType;
use App\Models\Partner;
use App\Services\PartnerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class PartnerController extends Controller
{
    public function __construct(
        private readonly PartnerService $partners,
    ) {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Partner::class);

        $filters = PartnerFilters::fromRequest($request, PartnerService::ALLOWED_SORTS);
        $user = $request->user();

        return Inertia::render('partners/index', [
            'partners' => $this->partners->paginate($filters, $user),
            'filters' => $filters->toArray(),
            'organizationTypes' => OrganizationType::orderBy('name')->get(['id', 'name']),
            'counties' => County::orderBy('name')->get(['id', 'name']),
            'can' => [
                'create' => $user->can('create', Partner::class),
                'export' => $user->can('export', Partner::class),
            ],
        ]);
    }

    public function show(Request $request, Partner $partner): Response
    {
        $this->authorize('view', $partner);

        $partner = $this->partners->findForShow($partner);
        $user = $request->user();

        return Inertia::render('partners/show', [
            'partner' => (new PartnerResource($partner))->resolve(),
            'can' => [
                'update' => $user->can('update', $partner),
                'delete' => $user->can('delete', $partner),
                'verify' => $user->can('verify', $partner),
                'print' => $user->can('print', $partner),
            ],
        ]);
    }

    public function destroy(Partner $partner): RedirectResponse
    {
        $this->authorize('delete', $partner);

        $this->partners->delete($partner);

        return redirect()
            ->route('partners.index')
            ->with('success', 'Partner deleted.');
    }

    public function verify(Request $request, Partner $partner): RedirectResponse
    {
        $this->authorize('verify', $partner);

        $action = $request->validate([
            'action' => ['required', 'in:verify,reject'],
        ])['action'];

        $message = $this->partners->verifyOrReject($partner, $action);

        return back()->with('success', $message);
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $this->authorize('export', Partner::class);

        $filters = PartnerFilters::fromRequest($request, PartnerService::ALLOWED_SORTS);

        return Excel::download(
            new PartnersExport($this->partners->exportQuery($filters, $request->user())),
            'partners-' . now()->format('Y-m-d') . '.xlsx',
        );
    }

    public function exportPdf(Request $request): HttpResponse
    {
        $this->authorize('export', Partner::class);

        $filters = PartnerFilters::fromRequest($request, PartnerService::ALLOWED_SORTS);

        return $this->partners->renderListPdf($filters, $request->user());
    }

    public function print(Partner $partner): HttpResponse
    {
        $this->authorize('print', $partner);

        return $this->partners->renderPartnerPdf($partner);
    }
}