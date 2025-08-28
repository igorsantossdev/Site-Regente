<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $primaryKey = 'post_id'; // seta a chave primaria como post_id

    public $incrementing = true; 
    protected $keyType = 'int';
    use HasFactory;

    protected $fillable =[
        'user_id',
        'titulo',
        'Conteudo',
    ];
}
