<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use App\Models\User;

class AuthController extends Controller
{
    use ApiResponse;

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        $credentials = $request->only('email', 'password');

        if (!$token = auth('api')->attempt($credentials)) {
            return $this->error('Invalid credentials', 401);
        }

        $user = auth('api')->user();

        if ($user->status !== 'active') {
            auth('api')->logout();
            return $this->error('Account is inactive or suspended', 403);
        }

        return $this->respondWithToken($token);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:fleet_manager,dispatcher,safety_officer,financial_analyst',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'status' => 'active',
        ]);

        $user->assignRole($request->role);

        $token = auth('api')->login($user);

        return $this->respondWithToken($token);
    }

    public function logout()
    {
        auth('api')->logout();
        return $this->success(null, 'Successfully logged out');
    }

    public function refresh()
    {
        try {
            $token = auth('api')->refresh();
            return $this->respondWithToken($token);
        }
        catch (\Exception $e) {
            return $this->error('Could not refresh token', 401);
        }
    }

    public function me()
    {
        $user = auth('api')->user();
        $user->load('roles.permissions');

        return $this->success([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'status' => $user->status,
            'role' => $user->roles->pluck('name')->first(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        $user = auth('api')->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->error('Current password is incorrect', 400);
        }

        $user->update(['password' => $request->new_password]);

        return $this->success(null, 'Password updated successfully');
    }

    protected function respondWithToken(string $token)
    {
        $user = auth('api')->user();

        return $this->success([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->pluck('name')->first(),
            ],
        ], 'Login successful');
    }
}
