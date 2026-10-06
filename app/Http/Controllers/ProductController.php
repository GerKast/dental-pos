<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    // 1. Mostrar la lista de productos
    public function index()
    {
        return Inertia::render('Products/Index', [
            'products' => Product::latest()->get()
        ]);
    }

    // 2. Guardar un nuevo producto
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|unique:products',
            'name' => 'required',
            'brand' => 'required',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'type' => 'required|in:frame,lens,accessory',
        ]);

        Product::create($validated);

        return redirect()->back(); // Recarga la página automáticamente
    }
}
