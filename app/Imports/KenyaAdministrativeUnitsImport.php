<?php

namespace App\Imports;

use App\Models\County;
use App\Models\SubCounty;
use App\Models\Ward;
use App\Models\Village;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class KenyaAdministrativeUnitsImport implements ToCollection, WithHeadingRow, WithChunkReading, WithValidation
{
    /** @var array<string, County> */
    private array $processedCounties = [];

    /** @var array<string, SubCounty> */
    private array $processedSubCounties = [];

    /** @var array<string, Ward> */
    private array $processedWards = [];

    /**
     * Generate a unique code for an administrative unit.
     *
     * Format: PREFIX-PARENTID-BASECODE[-N]
     *  - county:      C-0000-KITU
     *  - sub_county:  SC-0001-KITU
     *  - ward:        W-0002-NGOM
     *  - village:     V-0047-KYAN
     */
    private function generateUniqueCode(string $level, string $name, ?int $parentId = null): string
    {
        $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', $name);
        $baseCode = strtoupper(substr($cleanName, 0, 4));

        if (strlen($baseCode) < 3) {
            $baseCode = str_pad($baseCode, 3, 'X');
        }

        $configs = [
            'county' => ['prefix' => 'C', 'model' => County::class],
            'sub_county' => ['prefix' => 'SC', 'model' => SubCounty::class],
            'ward' => ['prefix' => 'W', 'model' => Ward::class],
            'village' => ['prefix' => 'V', 'model' => Village::class],
        ];

        $config = $configs[$level] ?? ['prefix' => 'X', 'model' => null];
        $prefix = $config['prefix'];
        $model = $config['model'];

        $parentPart = $parentId ? sprintf('%04d', $parentId) : '0000';
        $code = sprintf('%s-%s-%s', $prefix, $parentPart, $baseCode);

        if ($model) {
            $counter = 1;
            $originalCode = $code;

            while ($model::where('code', $code)->exists()) {
                $code = $originalCode . '-' . $counter++;
                if ($counter > 100) {
                    $code = $originalCode . '-' . uniqid();
                    break;
                }
            }
        }

        return $code;
    }

    private function getOrCreateCounty(string $countyName, ?string $countyCode = null): County
    {
        $cacheKey = strtolower(trim($countyName));

        if (isset($this->processedCounties[$cacheKey])) {
            return $this->processedCounties[$cacheKey];
        }

        $county = County::firstOrCreate(
            ['name' => trim($countyName)],
            ['code' => $countyCode ?? $this->generateUniqueCode('county', $countyName)]
        );

        if (!$county->code) {
            $county->code = $this->generateUniqueCode('county', $county->name);
            $county->save();
        }

        return $this->processedCounties[$cacheKey] = $county;
    }

    private function getOrCreateSubCounty(string $subCountyName, County $county, ?string $subCountyCode = null): SubCounty
    {
        $cacheKey = $county->id . '_' . strtolower(trim($subCountyName));

        if (isset($this->processedSubCounties[$cacheKey])) {
            return $this->processedSubCounties[$cacheKey];
        }

        $subCounty = SubCounty::firstOrCreate(
            ['name' => trim($subCountyName), 'county_id' => $county->id],
            ['code' => $subCountyCode ?? $this->generateUniqueCode('sub_county', $subCountyName, $county->id)]
        );

        if (!$subCounty->code) {
            $subCounty->code = $this->generateUniqueCode('sub_county', $subCounty->name, $county->id);
            $subCounty->save();
        }

        return $this->processedSubCounties[$cacheKey] = $subCounty;
    }

    private function getOrCreateWard(string $wardName, SubCounty $subCounty, ?string $wardCode = null): Ward
    {
        $cacheKey = $subCounty->id . '_' . strtolower(trim($wardName));

        if (isset($this->processedWards[$cacheKey])) {
            return $this->processedWards[$cacheKey];
        }

        // Schema: wards has only `sub_county_id` (no `county_id`).
        $ward = Ward::firstOrCreate(
            ['name' => trim($wardName), 'sub_county_id' => $subCounty->id],
            ['code' => $wardCode ?? $this->generateUniqueCode('ward', $wardName, $subCounty->id)]
        );

        if (!$ward->code) {
            $ward->code = $this->generateUniqueCode('ward', $ward->name, $subCounty->id);
            $ward->save();
        }

        return $this->processedWards[$cacheKey] = $ward;
    }

    private function createVillage(string $villageName, Ward $ward, ?string $villageCode = null): Village
    {
        // Schema: villages has only `ward_id` (no `county_id` / `sub_county_id`).
        $village = Village::firstOrCreate(
            ['name' => trim($villageName), 'ward_id' => $ward->id],
            ['code' => $villageCode ?? $this->generateUniqueCode('village', $villageName, $ward->id)]
        );

        if (!$village->code) {
            $village->code = $this->generateUniqueCode('village', $village->name, $ward->id);
            $village->save();
        }

        return $village;
    }

    public function collection(Collection $rows): void
    {
        // No DB transaction here — the seeder owns it.
        foreach ($rows as $row) {
            if (empty($row['county'] ?? null)) {
                continue;
            }

            $county = $this->getOrCreateCounty($row['county'], $row['county_code'] ?? null);

            if (empty($row['sub_county'] ?? null)) {
                continue;
            }
            $subCounty = $this->getOrCreateSubCounty($row['sub_county'], $county, $row['sub_county_code'] ?? null);

            if (empty($row['ward'] ?? null)) {
                continue;
            }
            $ward = $this->getOrCreateWard($row['ward'], $subCounty, $row['ward_code'] ?? null);

            if (!empty($row['village'] ?? null)) {
                $this->createVillage($row['village'], $ward, $row['village_code'] ?? null);
            }
        }
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function rules(): array
    {
        return [
            'county' => 'required|string|max:255',
            'sub_county' => 'nullable|string|max:255',
            'ward' => 'nullable|string|max:255',
            'village' => 'nullable|string|max:255',
            'county_code' => 'nullable|string|max:50',
            'sub_county_code' => 'nullable|string|max:50',
            'ward_code' => 'nullable|string|max:50',
            'village_code' => 'nullable|string|max:50',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'county.required' => 'County name is required in row :attribute',
        ];
    }

    public function prepareForValidation($data, $index)
    {
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = trim($value);
            }
        }

        return $data;
    }
}