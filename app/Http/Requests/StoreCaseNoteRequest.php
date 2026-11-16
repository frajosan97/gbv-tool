<?php

namespace App\Http\Requests;

use App\Models\GbvCase;
use Illuminate\Foundation\Http\FormRequest;

class StoreCaseNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        $gbvCase = $this->route('gbvCase');

        if (!$gbvCase instanceof GbvCase) {
            return false;
        }

        return $this->user()->can('update', $gbvCase);
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'min:2', 'max:10000'],
            'note_type_id' => ['nullable', 'integer', 'exists:note_types,id'],
            'is_private' => ['sometimes', 'boolean'],
            'is_important' => ['sometimes', 'boolean'],
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => ['file', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'note_type_id.exists' => 'The selected note type is invalid.',
            'attachments.max' => 'You may upload a maximum of 10 attachments.',
            'attachments.*.max' => 'Each attachment must be 10 MB or smaller.',
        ];
    }
}