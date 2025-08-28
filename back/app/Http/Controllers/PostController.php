<?php

namespace App\Http\Controllers;
use App\Http\Requests\StorePostRequest;
use App\Models\User;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
        return Post::all();
    }

    public function store(StorePostRequest $request)
    {

        $data = $request->validated();

        try{
            $Post = new Post();
            $Post -> fill($data);
            $Post ->save();

            return response()->json(["Resposta: Post criado com sucesso"], 201);

        }catch(\Exception $e){
            return response()->json(["Resposta: erro ao criar post". $e], 403); 
        }
    }

    
    public function show(string $id)
    {
        try{
        $usuario = User::FindOrFail($id);
        return POST::where('user_id', $id)->get();
      }catch(\Exception $e){
        return response()->json(["Resposta: usuario não encontrado"], 403);
      }
    } 
    
    public function showOne($userId, $postId)
    {
        try{
            $usuario = User::FindOrFail($userId);
            $post = Post::FindOrFail($postId);

            return POST::where('user_id', $userId)->where('post_id', $postId)->get();


            }catch(\Exception $e){
            return response()->json(["Resposta: usuario ou post não encontrado"], 403);
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
