<?php

namespace App\Exports;

use App\Models\Partner;
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

class PartnersExport implements
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
    private const LAST_COL = 'K';

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

    /** Data starts at A5 (headers); rows 1-3 are the branded header. */
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
            'Organization',
            'Registration #',
            'Type',
            'County',
            'Status',
            'Verified',
            'Users',
            'Survivors',
            'Cases',
            'Created',
        ];
    }

    /**
     * @param  Partner  $p
     * @return array<int, mixed>
     */
    public function map($p): array
    {
        static $i = 0;
        $i++;

        return [
            $i,
            $p->organization_name,
            $p->registration_number ?? '—',
            $p->organizationType?->name ?? '—',
            $p->county?->name ?? '—',
            ucfirst($p->status ?? 'unknown'),
            $p->verified_at ? 'Yes' : 'No',
            (int) $p->users_count,
            (int) $p->survivors_count,
            (int) $p->gbv_cases_count,
            $p->created_at?->format('Y-m-d') ?? '—',
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
        // Merge A1:B3 for the logo block so title sits beside it
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

        // Title on row 2, columns C..K
        $sheet->mergeCells('C' . self::TITLE_ROW . ':' . self::LAST_COL . self::TITLE_ROW);
        $sheet->setCellValue('C' . self::TITLE_ROW, 'Partners Report');
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

        // Subtitle on row 3, columns C..K
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

        // Teal rule under the header block
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

        foreach (['H', 'I', 'J'] as $col) {
            $sheet->getStyle("{$col}" . self::DATA_ROW . ":{$col}{$lastRow}")
                ->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        }

        $sheet->getStyle('A' . self::DATA_ROW . ":A{$lastRow}")
            ->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_CENTER);
    }

    private function styleStatusColumn(Worksheet $sheet, int $lastRow): void
    {
        $palette = [
            'active' => $this->hex('primary'),
            'pending' => 'F59E0B',
            'suspended' => $this->hex('red'),
            'inactive' => $this->hex('slate_500'),
        ];
        $default = $this->hex('slate_500');

        for ($row = self::DATA_ROW; $row <= $lastRow; $row++) {
            $status = strtolower((string) $sheet->getCell("F{$row}")->getValue());
            $rgb = $palette[$status] ?? $default;

            $sheet->getStyle("F{$row}")->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => $rgb],
                ],
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
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