<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

trait HandlesLookupResource
{
    abstract protected function modelClass(): string;

    abstract protected function pageName(): string;

    /** @return array<int, array<string, mixed>> */
    abstract protected function fields(): array;

    /** @return array<string, mixed> */
    abstract protected function rules(?int $id = null): array;

    /**
     * Default ordering column.
     */
    protected function defaultSort(): string
    {
        return 'sort_order';
    }

    /**
     * Default ordering direction.
     */
    protected function defaultDirection(): string
    {
        return 'asc';
    }

    /**
     * Allowed sorting columns.
     *
     * @return array<int, string>
     */
    protected function sortableColumns(): array
    {
        return ['id', 'name', 'sort_order'];
    }

    /**
     * Pagination size.
     */
    protected function perPage(): int
    {
        return 15;
    }

    /**
     * Searchable columns (name/slug/code by default).
     *
     * @return array<int, string>
     */
    protected function searchableColumns(): array
    {
        return ['name', 'slug', 'code'];
    }

    public function index(Request $request): Response
    {
        /** @var class-string<Model> $model */
        $model = $this->modelClass();

        $query = $model::query();

        // ---- Search ----------------------------------------------------
        if ($request->filled('search')) {
            $search = (string) $request->string('search');

            $query->where(function ($q) use ($search) {
                foreach ($this->searchableColumns() as $column) {
                    $q->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        // ---- Boolean filter -------------------------------------------
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // ---- Sort ------------------------------------------------------
        $allowedSorts = $this->sortableColumns();

        $sort = $request->input('sort', $this->defaultSort());
        $sort = is_string($sort) && in_array($sort, $allowedSorts, true)
            ? $sort
            : $this->defaultSort();

        $dir = $request->input('dir', $this->defaultDirection());
        $dir = is_string($dir) && in_array(strtolower($dir), ['asc', 'desc'], true)
            ? strtolower($dir)
            : $this->defaultDirection();

        // ---- Paginate --------------------------------------------------
        $records = $query
            ->orderBy($sort, $dir)
            ->paginate($this->perPage())
            ->withQueryString();

        // ---- Filters payload (ALWAYS strings, never null) -------------
        // This is what the frontend consumes — required keys, no nulls.
        $filters = [
            'search' => (string) $request->input('search', ''),
            'is_active' => $request->has('is_active')
                ? ($request->boolean('is_active') ? '1' : '0')
                : '',
            'sort' => $sort,
            'dir' => $dir,
        ];

        return Inertia::render(
            'system-settings/' . strtolower($this->pageName()),
            [
                'records' => $records,
                'filters' => $filters,
                'fields' => $this->fields(),
            ]
        );
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());

        /** @var class-string<Model> $model */
        $model = $this->modelClass();

        $model::create($data);

        return back()->with('success', 'Record created successfully.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        /** @var class-string<Model> $model */
        $model = $this->modelClass();

        $record = $model::findOrFail($id);

        $data = $request->validate($this->rules($id));

        $record->update($data);

        return back()->with('success', 'Record updated successfully.');
    }

    public function destroy(int $id): RedirectResponse
    {
        /** @var class-string<Model> $model */
        $model = $this->modelClass();

        $record = $model::findOrFail($id);

        $record->delete();

        return back()->with('success', 'Record deleted successfully.');
    }
}