<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $phone
 * @property Carbon|null $phone_verified_at
 * @property string|null $avatar
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property int|null $county_id
 * @property int|null $sub_county_id
 * @property int|null $ward_id
 * @property int|null $village_id
 * @property int|null $partner_id
 * @property string|null $badge_number
 * @property bool $is_active
 * @property Carbon|null $last_login_at
 * @property Carbon|null $password_changed_at
 * @property int $login_attempts
 * @property Carbon|null $locked_until
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read string $avatar_url
 */
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory,
        Notifiable,
        SoftDeletes,
        PasskeyAuthenticatable,
        TwoFactorAuthenticatable,
        HasRoles;

    /** Disk used to store avatars. */
    public const AVATAR_DISK = 'public';

    /** Folder within the disk where avatars live. */
    public const AVATAR_DIRECTORY = 'avatars';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'avatar',
        'password',
        'county_id',
        'sub_county_id',
        'ward_id',
        'village_id',
        'partner_id',
        'badge_number',
        'is_active',
        'last_login_at',
        'password_changed_at',
        'login_attempts',
        'locked_until',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Append the computed avatar URL to array/json output
     * so the frontend never has to know about storage paths.
     */
    protected $appends = [
        'avatar_url',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password_changed_at' => 'datetime',
            'locked_until' => 'datetime',
            'is_active' => 'bool',
            'login_attempts' => 'integer',
        ];
    }

    /* =========================================================
     *  AVATAR
     * ========================================================= */

    /**
     * Full public URL for the user's avatar, or the default image.
     */
    protected function avatarUrl(): Attribute
    {
        return Attribute::get(function (): string {
            if ($this->avatar && Storage::disk(self::AVATAR_DISK)->exists($this->avatar)) {
                return asset('storage/' . ltrim($this->avatar, '/'));
            }

            return asset('images/default-avatar.png');
        });
    }

    /**
     * Persist a newly uploaded avatar, removing the previous file.
     *
     * @param  \Illuminate\Http\UploadedFile  $file
     */
    public function updateAvatar($file): void
    {
        $this->deleteAvatarFile();

        $this->avatar = $file->store(self::AVATAR_DIRECTORY, self::AVATAR_DISK);
        $this->save();
    }

    /**
     * Remove the avatar reference and its stored file.
     */
    public function removeAvatar(): void
    {
        $this->deleteAvatarFile();
        $this->avatar = null;
        $this->save();
    }

    /**
     * Delete the current avatar file from disk (if it exists).
     */
    protected function deleteAvatarFile(): void
    {
        if ($this->avatar && Storage::disk(self::AVATAR_DISK)->exists($this->avatar)) {
            Storage::disk(self::AVATAR_DISK)->delete($this->avatar);
        }
    }

    /**
     * Clean up the avatar file when the user is hard-deleted.
     * (Soft deletes keep the file; it is only removed on forceDelete.)
     */
    protected static function booted(): void
    {
        static::forceDeleting(function (User $user) {
            $user->deleteAvatarFile();
        });
    }

    /* =========================================================
     *  ROLES / HELPERS
     * ========================================================= */

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('Super Admin')
            || $this->is_super_admin === true;
    }

    public function isPartnerAdmin(): bool
    {
        return $this->hasRole('Partner Admin');
    }

    /* =========================================================
     *  LOCATION / ORGANIZATION
     * ========================================================= */

    public function county(): BelongsTo
    {
        return $this->belongsTo(County::class);
    }

    public function subCounty(): BelongsTo
    {
        return $this->belongsTo(SubCounty::class);
    }

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class);
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    /* =========================================================
     *  SURVIVORS
     * ========================================================= */

    public function createdSurvivors(): HasMany
    {
        return $this->hasMany(Survivor::class, 'created_by');
    }

    /* =========================================================
     *  GBV CASES (user is an actor in many roles)
     * ========================================================= */

    public function casesCreated(): HasMany
    {
        return $this->hasMany(GbvCase::class, 'created_by');
    }

    public function casesAsPrimaryOfficer(): HasMany
    {
        return $this->hasMany(GbvCase::class, 'primary_officer_id');
    }

    public function casesConcluded(): HasMany
    {
        return $this->hasMany(GbvCase::class, 'concluded_by');
    }

    /* =========================================================
     *  CASE FILES
     * ========================================================= */

    public function caseFilesCreated(): HasMany
    {
        return $this->hasMany(CaseFile::class, 'created_by');
    }

    public function caseFilesReviewed(): HasMany
    {
        return $this->hasMany(CaseFile::class, 'reviewed_by');
    }

    /* =========================================================
     *  REFERRALS
     * ========================================================= */

    public function referralsCreated(): HasMany
    {
        return $this->hasMany(Referral::class, 'created_by');
    }

    public function referralUpdates(): HasMany
    {
        return $this->hasMany(ReferralUpdate::class);
    }

    /* =========================================================
     *  PERPETRATORS
     * ========================================================= */

    public function perpetratorsCreated(): HasMany
    {
        return $this->hasMany(Perpetrator::class, 'created_by');
    }

    /* =========================================================
     *  NOTES / TIMELINES / CONCLUSIONS
     * ========================================================= */

    public function caseNotes(): HasMany
    {
        return $this->hasMany(CaseNote::class, 'created_by');
    }

    public function caseTimelines(): HasMany
    {
        return $this->hasMany(CaseTimeline::class, 'created_by');
    }

    public function caseConclusions(): HasMany
    {
        return $this->hasMany(CaseConclusion::class, 'concluded_by');
    }

    /* =========================================================
     *  AUDIT
     * ========================================================= */

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }
}