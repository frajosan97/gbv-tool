<?php

// app/Support/PdfMerger.php
namespace App\Support;

use setasign\Fpdi\Fpdi;

class PdfMerger
{
    /** @param string[] $pdfPaths  absolute paths; first is the main report */
    public static function merge(array $pdfPaths, string $outputPath): void
    {
        $pdf = new Fpdi();

        foreach ($pdfPaths as $path) {
            if (!is_file($path)) {
                continue;
            }

            try {
                $pageCount = $pdf->setSourceFile($path);
            } catch (\Throwable) {
                // Corrupt/encrypted PDF — skip rather than fail the whole report
                continue;
            }

            for ($i = 1; $i <= $pageCount; $i++) {
                $tpl = $pdf->importPage($i);
                $size = $pdf->getTemplateSize($tpl);

                $pdf->AddPage(
                    $size['orientation'],
                    [$size['width'], $size['height']],
                );
                $pdf->useTemplate($tpl);
            }
        }

        $pdf->Output('F', $outputPath);
    }
}