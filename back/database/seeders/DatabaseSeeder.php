<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
    
        Post::factory()->create([
            'user_id' =>2,
            'titulo'=>'Lorem ipsum dolor title2',
            'conteudo'=>'Lorem ipsum dolor content2',
        ]);
    }
}
