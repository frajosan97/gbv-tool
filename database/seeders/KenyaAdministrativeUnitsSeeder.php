<?php

namespace Database\Seeders;

use App\Imports\KenyaAdministrativeUnitsImport;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Excel as ExcelType;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class KenyaAdministrativeUnitsSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/kitui_villages.csv');

        if (!file_exists($path)) {
            $this->command->error("File not found: {$path}");
            return;
        }

        try {
            DB::transaction(function () use ($path) {
                Excel::import(
                    new KenyaAdministrativeUnitsImport,
                    $path,
                    null,
                    ExcelType::CSV
                );
            });
        } catch (Throwable $e) {
            $this->command->error('Import failed: ' . $e->getMessage());
            report($e);
        }
    }
}