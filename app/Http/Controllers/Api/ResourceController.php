<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ResourceController extends Controller
{
    public function index(): JsonResponse
    {
        $disk = Storage::disk('public');

        $files = $disk->allFiles('resources');

        $resources = collect($files)
            ->filter(fn($file) => !str_starts_with(
                basename($file),
                '.'
            ))
            ->map(function ($file) use ($disk) {
                $extension = strtolower(
                    pathinfo($file, PATHINFO_EXTENSION)
                );

                $filename = pathinfo(
                    $file,
                    PATHINFO_FILENAME
                );

                $type = match ($extension) {
                    'pdf' => 'pdf',
                    'doc', 'docx', 'odt' => 'doc',
                    'xls', 'xlsx', 'csv', 'ods' => 'sheet',
                    'jpg', 'jpeg', 'png', 'gif',
                    'webp', 'svg' => 'image',
                    default => 'other',
                };

                $directory = dirname($file);

                $category = $directory === 'resources'
                    ? 'General'
                    : basename($directory);

                $size = $disk->size($file);
                $modified = $disk->lastModified($file);

                return [
                    'id' => $file,
                    'title' => $filename,
                    'description' => null,
                    'category' => $category,
                    'type' => $type,
                    'url' => asset('storage/' . $file),
                    'updatedAt' => date(
                        DATE_ATOM,
                        $modified
                    ),
                    'size' => $this->formatSize($size),
                ];
            })
            ->values();

        return response()->json([
            'data' => $resources,
            'total' => $resources->count(),
        ]);
    }

    private function formatSize(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        }

        if ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        }

        return $bytes . ' bytes';
    }
}
