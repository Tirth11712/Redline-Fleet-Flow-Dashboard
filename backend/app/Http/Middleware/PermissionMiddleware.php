<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class PermissionMiddleware
{
    public function handle(Request $request, Closure $next, ...$permissions)
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        foreach ($permissions as $permission) {
            if (!$user->hasPermissionTo($permission)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Required permission: ' . $permission,
                ], 403);
            }
        }

        return $next($request);
    }
}
