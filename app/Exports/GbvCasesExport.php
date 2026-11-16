<?php

namespace App\Exports;

use App\Models\GbvCase;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Enumerable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GbvCasesExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    ShouldAutoSize,
    WithStyles,
    WithEvents,
    WithCustomStartCell
{
    private const LOGO_ROW = 1;
    private const TITLE_ROW = 2;
    private const SUBTITLE_ROW = 3;
    private const HEADER_ROW = 5;
    private const DATA_ROW = 6;
    private const LAST_COL = 'L';

    private array $colors;
    private array $brand;
    private array $contacts;
    private array $hexCache = [];

    public function __construct(private Builder $query)
    {
        $this->colors = config('reports.colors');
        $this->brand = config('reports.brand');
        $this->contacts = config('reports.contacts');
    }

    public function startCell(): string
    {
        return 'A' . self::HEADER_ROW;
    }

    public function collection(): Enumerable
    {
        return $this->query->get();
    }

    public function headings(): array
    {
        return [
            '#',
            'Case #',
            'Incident #',
            'Survivor',
            'Incident Type',
            'Incident Date',
            'Status',
            'Priority',
            'Police',
            'Medical',
            'Sensitive',
            'Location',
        ];
    }

    /**
     * @param  GbvCase  $c
     * @return array<int, mixed>
     */
    public function map($c): array
    {
        static $i = 0;
        $i++;

        $location = implode(', ', array_filter([
            $c->village?->name,
            $c->ward?->name,
            $c->subCounty?->name,
            $c->county?->name,
        ]));

        return [
            $i,
            $c->case_number,
            $c->incident_number ?? '—',
            $c->survivor?->full_name ?? $c->survivor?->unique_code ?? '—',
            $c->incidentType?->name ?? $c->incident_type_other ?? '—',
            $c->incident_date?->format('Y-m-d') ?? '—',
            $c->status?->name ?? '—',
            $c->priority?->name ?? '—',
            $c->reported_to_police ? 'Yes' : 'No',
            $c->medical_attention ? 'Yes' : 'No',
            $c->is_sensitive ? 'Yes' : 'No',
            $location ?: '—',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $headerRange = 'A' . self::HEADER_ROW . ':' . self::LAST_COL . self::HEADER_ROW;
        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 10,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $this->hex('primary')],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getRowDimension(self::HEADER_ROW)->setRowHeight(26);

        return [];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastRow = $sheet->getHighestRow();

                $this->drawBrandedHeader($sheet);
                $this->styleTable($sheet, $lastRow);
                $this->styleStatusColumn($sheet, $lastRow);
                $this->drawFooter($sheet, $lastRow);
            },
        ];
    }

    private function drawBrandedHeader(Worksheet $sheet): void
    {
        $sheet->mergeCells('A1:B3');
        $sheet->getRowDimension(self::LOGO_ROW)->setRowHeight(24);
        $sheet->getRowDimension(self::TITLE_ROW)->setRowHeight(24);
        $sheet->getRowDimension(self::SUBTITLE_ROW)->setRowHeight(18);

        $logoPath = public_path($this->brand['logo']);
        if (is_file($logoPath)) {
            $drawing = new Drawing();
            $drawing->setPath($logoPath);
            $drawing->setHeight(56);
            $drawing->setCoordinates('A' . self::LOGO_ROW);
            $drawing->setOffsetX(6);
            $drawing->setOffsetY(4);
            $drawing->setWorksheet($sheet);
        }

        $sheet->mergeCells('C' . self::TITLE_ROW . ':' . self::LAST_COL . self::TITLE_ROW);
        $sheet->setCellValue('C' . self::TITLE_ROW, 'GBV Cases Report');
        $sheet->getStyle('C' . self::TITLE_ROW)->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 16,
                'color' => ['rgb' => $this->hex('primary')],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->mergeCells('C' . self::SUBTITLE_ROW . ':' . self::LAST_COL . self::SUBTITLE_ROW);
        $sheet->setCellValue(
            'C' . self::SUBTITLE_ROW,
            $this->brand['county'] . ' • ' . $this->brand['tagline']
            . '  |  Generated ' . now()->format('F j, Y g:i A'),
        );
        $sheet->getStyle('C' . self::SUBTITLE_ROW)->applyFromArray([
            'font' => [
                'italic' => true,
                'size' => 9,
                'color' => ['rgb' => $this->hex('slate_500')],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->getStyle('A3:' . self::LAST_COL . '3')->applyFromArray([
            'borders' => [
                'bottom' => [
                    'borderStyle' => Border::BORDER_MEDIUM,
                    'color' => ['rgb' => $this->hex('primary')],
                ],
            ],
        ]);
    }

    private function styleTable(Worksheet $sheet, int $lastRow): void
    {
        $sheet->freezePane('A' . self::DATA_ROW);
        $sheet->setAutoFilter(
            'A' . self::HEADER_ROW . ':' . self::LAST_COL . $lastRow,
        );

        $sheet->getStyle(self::DATA_ROW . ':' . $lastRow)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => $this->hex('slate_200')],
                ],
            ],
        ]);

        $zebra = $this->hex('slate_50');
        for ($row = self::DATA_ROW; $row <= $lastRow; $row++) {
            if (($row - self::DATA_ROW) % 2 === 1) {
                $sheet->getStyle("A{$row}:" . self::LAST_COL . $row)
                    ->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()
                    ->setRGB($zebra);
            }
        }

        $sheet->getStyle('A' . self::DATA_ROW . ":A{$lastRow}")
            ->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_CENTER);
    }

    private function styleStatusColumn(Worksheet $sheet, int $lastRow): void
    {
        // Column I is "Police" (Yes/No), column K is "Sensitive" (Yes/No).
        // Apply red background to sensitive cases; teal for Police=Yes.
        for ($row = self::DATA_ROW; $row <= $lastRow; $row++) {
            $police = strtolower((string) $sheet->getCell("I{$row}")->getValue());
            $sensitive = strtolower((string) $sheet->getCell("K{$row}")->getValue());

            if ($sensitive === 'yes') {
                $sheet->getStyle("K{$row}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => $this->hex('red')],
                    ],
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);
            }
            if ($police === 'yes') {
                $sheet->getStyle("I{$row}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => $this->hex('primary')],
                    ],
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);
            }
        }
    }

    private function drawFooter(Worksheet $sheet, int $lastRow): void
    {
        $row = $lastRow + 2;
        $sheet->mergeCells("A{$row}:" . self::LAST_COL . $row);
        $sheet->setCellValue(
            "A{$row}",
            $this->brand['confidential']
            . '  |  GBV Helpline: ' . $this->contacts['gbv_helpline']
            . '  •  Police: ' . $this->contacts['police']
            . '  •  Child: ' . $this->contacts['child_helpline'],
        );
        $sheet->getStyle("A{$row}")->applyFromArray([
            'font' => [
                'size' => 8,
                'italic' => true,
                'color' => ['rgb' => $this->hex('red')],
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
    }

    private function hex(string $key): string
    {
        return $this->hexCache[$key] ??= ltrim(
            $this->colors[$key] ?? '000000',
            '#',
        );
    }
}