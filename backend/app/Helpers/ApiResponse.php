<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    /**
     * Success response
     */
    public static function success($data = null, $message = 'Success', $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    /**
     * Error response
     */
    public static function error($message = 'Error', $status = 400, $errors = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], $status);
    }

    /**
     * Validation error response
     */
    public static function validation($errors, $message = 'Validation failed'): JsonResponse
    {
        return self::error($message, 422, $errors);
    }
}
