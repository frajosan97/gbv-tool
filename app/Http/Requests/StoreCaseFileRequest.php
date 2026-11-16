<?php

namespace App\Http\Requests;

use App\Models\GbvCase;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class StoreCaseFileRequest extends FormRequest
{
    private const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

    public function authorize(): bool
    {
        $case = $this->route('gbvCase')
            ?? $this->route('gbv_case')
            ?? $this->route('case');

        if (!$case instanceof GbvCase || !$this->user()) {
            return false;
        }

        $referralId = $this->input('referral_id');

        if ($referralId) {
            $referral = $case->referrals()->whereKey($referralId)->first();

            if (!$referral) {
                return false;
            }

            return $this->user()->can('update', $referral);
        }

        // Regular case file — authorize against the case.
        return $this->user()->can('update', $case);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'referral_id' => [
                'nullable',
                'integer',
                // The referral must belong to the parent case. Without this,
                // a caller could attach a file to an unrelated case's referral.
                function (string $attribute, $value, Closure $fail) {
                    if (!$value) {
                        return;
                    }

                    $case = $this->route('gbvCase')
                        ?? $this->route('gbv_case')
                        ?? $this->route('case');

                    if (
                        !$case instanceof GbvCase
                        || !$case->referrals()->whereKey($value)->exists()
                    ) {
                        $fail('The selected referral does not belong to this case.');
                    }
                },
            ],

            'file' => [
                'required',
                'file',
                'max:15360', // 15 MB in kilobytes
                'mimetypes:application/pdf,image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime',
                'extensions:pdf,jpg,jpeg,png,webp,mp4,webm,mov',
                function (string $attribute, $value, Closure $fail) {
                    if (!$value instanceof UploadedFile) {
                        return;
                    }

                    if ($value->getSize() > self::MAX_BYTES) {
                        $fail('The file must be 15 MB or smaller.');
                    }
                },
            ],

            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'file_type_id' => ['required', 'integer', 'exists:file_types,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Please choose a file to upload.',
            'file.max' => 'The file must be 15 MB or smaller.',
            'file.mimetypes' => 'Only PDF documents, JPG/PNG/WEBP images, and MP4/WEBM/MOV videos are allowed.',
            'file.extensions' => 'The file extension is not allowed.',
            'title.required' => 'Title is required.',
            'file_type_id.required' => 'Please select a file type.',
            'file_type_id.exists' => 'The selected file type does not exist.',
            'referral_id.exists' => 'The selected referral does not exist.',
        ];
    }
}