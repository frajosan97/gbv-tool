<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CaseFile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'gbv_case_id',
        'referral_id',
        'created_by',
        'file_number',
        'file_type_id',
        'title',
        'description',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    protected $hidden = ['file_path']; // never expose the internal storage path

    /* ---------- Relations ---------- */

    public function gbvCase(): BelongsTo
    {
        return $this->belongsTo(GbvCase::class);
    }

    /**
     * The referral this file was uploaded against, if any.
     * Null for regular case files (evidence, PRC, P3, etc.).
     */
    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function fileType(): BelongsTo
    {
        return $this->belongsTo(FileType::class);
    }

    /* ---------- Helpers ---------- */

    /**
     * Public URL for downloads (goes through an authorized route).
     */
    public function getDownloadUrlAttribute(): ?string
    {
        return $this->exists
            ? route('gbv-cases.files.download', [
                'gbvCase' => $this->gbv_case_id,
                'file' => $this->id,
            ])
            : null;
    }
}