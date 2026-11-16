<?php

// app/Support/CaseFilePdfBuilder.php
namespace App\Support;

use App\Models\CaseFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class CaseFilePdfBuilder
{
    /**
     * Convert a case file to an absolute PDF path, or null if unsupported.
     * Caller is responsible for deleting temp files (or use a cleanup sweep).
     */
    public static function toPdf(CaseFile $file): ?string
    {
        $disk = Storage::disk($file->disk ?? 'local');
        $path = $disk->path($file->file_path ?? $file->path ?? '');
        if (!is_file($path)) {
            return null;
        }

        $mime = $file->mime_type ?? (mime_content_type($path) ?: '');
        $tmp = tempnam(sys_get_temp_dir(), 'gbv_file_') . '.pdf';

        // Already a PDF
        if (str_contains($mime, 'pdf')) {
            copy($path, $tmp);
            return $tmp;
        }

        // Images → single-page PDF via Imagick
        if (str_starts_with($mime, 'image/')) {
            try {
                $img = new \Imagick($path);
                $img->setImageFormat('pdf');
                $img->setImageCompressionQuality(85);
                $img->writeImage($tmp);
                $img->clear();
                return $tmp;
            } catch (\Throwable) {
                return null;
            }
        }

        // Office docs → LibreOffice headless (only if you have soffice installed)
        if (preg_match('/(word|officedocument|msword|spreadsheet|presentation|rtf)/', $mime)) {
            $outDir = dirname($tmp);
            $proc = new Process([
                'soffice',
                '--headless',
                '--convert-to',
                'pdf',
                '--outdir',
                $outDir,
                $path,
            ]);
            $proc->setTimeout(120)->run();

            $converted = $outDir . '/' . pathinfo($path, PATHINFO_FILENAME) . '.pdf';
            if (is_file($converted)) {
                return $converted;
            }
            return null;
        }

        // Anything else — skip
        return null;
    }
}