<?php

namespace App\Models;

use App\Concerns\IsLookup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FileStatus extends Model
{
    use IsLookup;

    protected $fillable = [
        'slug',
        'name',
        'color',
        'icon',
        'description',
        'is_active',
        'is_terminal',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'bool',
        'is_terminal' => 'bool'
    ];

    public function caseFiles(): HasMany
    {
        return $this->hasMany(CaseFile::class);
    }
}