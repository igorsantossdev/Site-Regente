<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\User;
use Exception;

use PhpParser\Node\Stmt\TryCatch;

class RegController extends Controller

{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return User::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
      $data = $request ->validated();
      try{
          $response = new User();
          $response -> fill($data);
          $response -> save();
          
          return response() -> json($response, 201);

      }catch(\Exception $ex){
        return response()->json(["Resposta: usuario não inserido".$ex], 403);
      }
        

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {   

      try{
        $usuario = User::FindOrFail($id);
        return response()->json($usuario, 200);
      }catch(\Exception $e){
        return response()->json(["Resposta: usuario não encontrado"], 403);
      }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
