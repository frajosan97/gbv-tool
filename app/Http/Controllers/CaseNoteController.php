<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCaseNoteRequest;
use App\Models\CaseNote;
use App\Models\GbvCase;
use App\Models\NoteType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class CaseNoteController extends Controller
{
    public function store(StoreCaseNoteRequest $request, GbvCase $gbvCase): RedirectResponse
    {
        $this->authorize('create', [CaseNote::class, $gbvCase]);

        $data = $request->validated();

        $attachments = $this->storeAttachments($request, $gbvCase);

        $noteType = !empty($data['note_type_id'])
            ? NoteType::find($data['note_type_id'])
            : null;

        $gbvCase->notes()->create([
            'created_by' => $request->user()->id,
            'note_type_id' => $noteType?->id,
            'content' => $data['content'],
            'is_private' => $data['is_private']
                ?? $noteType?->is_private_by_default
                ?? false,
            'is_important' => $data['is_important'] ?? false,
            'attachments' => $attachments ?: null,
            'metadata' => null,
        ]);

        return back()->with('success', 'Note added.');
    }

    public function update(StoreCaseNoteRequest $request, GbvCase $gbvCase, CaseNote $note): RedirectResponse
    {
        abort_unless($note->gbv_case_id === $gbvCase->id, 404);

        $this->authorize('update', $note);

        $data = $request->validated();

        $attachments = $note->attachments ?? [];

        if ($request->hasFile('attachments')) {
            $attachments = array_merge(
                $attachments,
                $this->storeAttachments($request, $gbvCase),
            );
        }

        $note->update([
            'content' => $data['content'],
            'note_type_id' => $data['note_type_id'] ?? null,
            'is_private' => $data['is_private'] ?? $note->is_private,
            'is_important' => $data['is_important'] ?? $note->is_important,
            'attachments' => $attachments ?: null,
        ]);

        return back()->with('success', 'Note updated.');
    }

    public function destroy(GbvCase $gbvCase, CaseNote $note): RedirectResponse
    {
        abort_unless($note->gbv_case_id === $gbvCase->id, 404);

        $this->authorize('delete', $note);

        foreach ($note->attachments ?? [] as $attachment) {
            if (!empty($attachment['path'])) {
                Storage::disk('private')->delete($attachment['path']);
            }
        }

        $note->delete();

        return back()->with('success', 'Note deleted.');
    }

    private function storeAttachments(StoreCaseNoteRequest $request, GbvCase $gbvCase): array
    {
        $attachments = [];

        foreach ($request->file('attachments', []) as $file) {
            $attachments[] = [
                'path' => $file->store("gbv-cases/{$gbvCase->id}/notes", 'private'),
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
            ];
        }

        return $attachments;
    }
}