<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCaseFileRequest;
use App\Models\CaseFile;
use App\Models\GbvCase;
use App\Support\LogsTimeline;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GbvCaseFileController extends Controller
{
    use LogsTimeline;

    public function store(StoreCaseFileRequest $request, GbvCase $gbvCase): RedirectResponse
    {
        $uploaded = $request->file('file');

        $ext = strtolower($uploaded->getClientOriginalExtension());
        $original = $uploaded->getClientOriginalName();
        $mime = $uploaded->getMimeType();
        $size = $uploaded->getSize();

        $storedName = Str::uuid()->toString() . '.' . $ext;
        $path = $uploaded->storeAs("gbv-cases/{$gbvCase->id}/files", $storedName, 'local');

        $referralId = $request->input('referral_id') ?: null;

        DB::transaction(function () use ($request, $gbvCase, $original, $path, $mime, $size, $referralId, ) {
            $file = CaseFile::create([
                'gbv_case_id' => $gbvCase->id,
                'referral_id' => $referralId,
                'created_by' => $request->user()->id,
                'file_number' => $this->generateFileNumber($gbvCase),
                'file_type_id' => $request->input('file_type_id'),
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'file_path' => $path,
                'file_name' => $original,
                'file_size' => $size,
                'mime_type' => $mime,
            ]);

            $this->logTimeline(
                $gbvCase,
                'file',
                $referralId
                ? "Referral document uploaded: {$file->title}"
                : "File uploaded: {$file->title}",
                $file->description,
                $request->user(),
                [
                    'action' => 'uploaded',
                    'file_id' => $file->id,
                    'file_number' => $file->file_number,
                    'mime_type' => $file->mime_type,
                    'file_size' => $file->file_size,
                    'referral_id' => $referralId,
                ],
            );
        });

        return back()->with('success', 'File uploaded successfully.');
    }

    public function destroy(Request $request, GbvCase $gbvCase, CaseFile $file): RedirectResponse
    {
        abort_unless((int) $file->gbv_case_id === (int) $gbvCase->id, 404);

        // Referral-scoped file — authorize against the referral so the
        // receiving partner can remove a document they uploaded.
        if ($file->referral_id) {
            $referral = $file->referral;
            abort_unless($referral !== null, 404);

            $this->authorize('update', $referral);

            // Additionally restrict deletion: only the uploader, the
            // referral creator, or a super-admin can remove the file.
            $user = $request->user();
            $canDelete =
                $user->isSuperAdmin()
                || (int) $file->created_by === (int) $user->id
                || (int) $referral->created_by === (int) $user->id;

            abort_unless($canDelete, 403);
        } else {
            // Regular case file — case policy applies.
            $this->authorize('update', $gbvCase);
        }

        DB::transaction(function () use ($request, $gbvCase, $file) {
            if ($file->file_path) {
                Storage::disk('local')->delete($file->file_path);
            }

            $this->logTimeline(
                $gbvCase,
                'file',
                'File deleted: ' . $file->title,
                $file->description,
                $request->user(),
                [
                    'action' => 'deleted',
                    'file_id' => $file->id,
                    'file_number' => $file->file_number,
                    'referral_id' => $file->referral_id,
                ],
            );

            $file->delete();
        });

        return back()->with('success', 'File deleted.');
    }

    public function download(GbvCase $gbvCase, CaseFile $file)
    {
        abort_unless((int) $file->gbv_case_id === (int) $gbvCase->id, 404);

        // Referral-scoped file — authorize against the referral so the
        // receiving partner can download documents on their referral
        // without needing case-level view rights.
        if ($file->referral_id) {
            $referral = $file->referral;
            abort_unless($referral !== null, 404);
            $this->authorize('view', $referral);
        } else {
            $this->authorize('view', $gbvCase);
        }

        abort_unless(Storage::disk('local')->exists($file->file_path), 404);

        return response()->streamDownload(function () use ($file) {
            $stream = Storage::disk('local')->readStream($file->file_path);
            fpassthru($stream);
            fclose($stream);
        }, $file->file_name, [
            'Content-Type' => $file->mime_type ?: 'application/octet-stream',
        ]);
    }

    private function generateFileNumber(GbvCase $case): string
    {
        $year = now()->format('Y');
        $seq = CaseFile::withTrashed()->where('gbv_case_id', $case->id)->count() + 1;
        do {
            $num = sprintf('CF-%s-%s-%03d', $year, $case->case_number, $seq);
            $seq++;
        } while (CaseFile::withTrashed()->where('file_number', $num)->exists());

        return $num;
    }
}