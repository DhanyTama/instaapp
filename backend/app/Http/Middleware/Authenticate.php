<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Handle unauthenticated requests.
     */
    protected function unauthenticated($request, array $guards)
    {
        if ($request->expectsJson()) {
            abort(ApiResponse::error('Unauthenticated. Please login again!', 401));
        }

        parent::unauthenticated($request, $guards);
    }

    /**
     * Redirect non-JSON requests.
     */
    protected function redirectTo(Request $request): ?string
    {
        return $request->expectsJson() ? null : route('login');
    }
}
