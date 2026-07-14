<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        if (!$user->hasAnyRole($roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Required role: ' . implode(' or ', $roles),
            ], 403);
        }

        return $next($request);
    }
}
