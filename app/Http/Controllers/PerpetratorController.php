<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePerpetratorRequest;
use App\Http\Requests\UpdatePerpetratorRequest;
use App\Models\GbvCase;
use App\Models\Perpetrator;
use Illuminate\Http\RedirectResponse;

class PerpetratorController extends Controller
{
    /**
     * Store a new perpetrator for the given GBV case.
     */
    public function store(
        StorePerpetratorRequest $request,
        GbvCase $gbvCase,
    ): RedirectResponse {
        $data = $request->validated();

        $gbvCase->perpetrators()->create([
            'created_by' => $request->user()->id,
            'name' => $data['name'] ?? null,
            'name_known' => $data['name_known'] ?? false,
            'gender_option_id' => $data['gender_option_id'] ?? null,
            'age_range_id' => $data['age_range_id'] ?? null,
            'relationship_option_id' => $data['relationship_option_id'] ?? null,
            'relationship_details' => $data['relationship_details'] ?? null,
            'physical_description' => filled($data['physical_description_text'] ?? null)
                ? ['notes' => $data['physical_description_text']]
                : null,
            'identifying_features' => filled($data['identifying_features_text'] ?? null)
                ? ['notes' => $data['identifying_features_text']]
                : null,
            'is_repeat_offender' => $data['is_repeat_offender'] ?? false,
            'previous_incidents_count' => $data['previous_incidents_count'] ?? 0,
            'additional_info' => $data['additional_info'] ?? null,
        ]);

        return back()->with('success', 'Perpetrator added.');
    }

    public function update(
        UpdatePerpetratorRequest $request,
        GbvCase $gbvCase,
        Perpetrator $perpetrator,
    ): RedirectResponse {
        abort_unless($perpetrator->gbv_case_id === $gbvCase->id, 404);

        $data = $request->validated();

        $perpetrator->update([
            'name' => $data['name'] ?? null,
            'name_known' => $data['name_known'] ?? false,
            'gender_option_id' => $data['gender_option_id'] ?? null,
            'age_range_id' => $data['age_range_id'] ?? null,
            'relationship_option_id' => $data['relationship_option_id'] ?? null,
            'relationship_details' => $data['relationship_details'] ?? null,
            'physical_description' => filled($data['physical_description_text'] ?? null)
                ? ['notes' => $data['physical_description_text']]
                : null,
            'identifying_features' => filled($data['identifying_features_text'] ?? null)
                ? ['notes' => $data['identifying_features_text']]
                : null,
            'is_repeat_offender' => $data['is_repeat_offender'] ?? false,
            'previous_incidents_count' => $data['previous_incidents_count'] ?? 0,
            'additional_info' => $data['additional_info'] ?? null,
        ]);

        return back()->with('success', 'Perpetrator updated.');
    }

    /**
     * Remove a perpetrator from the case.
     */
    public function destroy(GbvCase $gbvCase, Perpetrator $perpetrator): RedirectResponse
    {
        abort_unless($perpetrator->gbv_case_id === $gbvCase->id, 404);

        $this->authorize('update', $gbvCase);

        $perpetrator->delete();

        return back()->with('success', 'Perpetrator removed.');
    }
}