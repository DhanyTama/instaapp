<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('unique_id')->unique();
            $table->string('username')->unique();
            $table->text('bio')->nullable();
            $table->string('avatar_url')->nullable();
            $table->enum('role', ['user', 'admin'])->default('user');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['unique_id', 'username', 'bio', 'avatar_url', 'role', 'deleted_at']);
        });
    }
};
