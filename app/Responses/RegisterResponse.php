<?php

namespace App\Responses;

use App\Models\Partner;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request)
    {
        $partner = Partner::where('email', $request->input('email'))->first();

        $message = 'Registration successful. Your organization is pending approval.';

        // Fortify logs the user in after registration — log them out so they
        // must authenticate explicitly once their account is approved.
        Auth::guard(config('fortify.guard'))->logout();

        if ($request->wantsJson()) {
            return new JsonResponse([
                'message' => $message,
                'status' => $partner?->status,
            ], 201);
        }

        // Invalidate the old (now logged-out) session and rotate the CSRF token
        // BEFORE flashing, so the flash lands in the fresh session.
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('register')
            ->with('success', $message);   // ← matches your shared flash key
    }
}