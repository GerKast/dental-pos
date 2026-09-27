<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB; // Para transacciones

class OrderController extends Controller
{
    // 1. Mostrar la pantalla del POS
    public function index()
    {
        return Inertia::render('POS/Index', [
            'products' => Product::where('stock', '>', 0)->get(), // Solo lo que hay en stock
            'clients' => Client::all()
        ]);
    }

    // 2. Procesar la Venta (¡La parte crítica!)
    public function store(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'cart' => 'required|array|min:1',
            'cart.*.id' => 'required|integer|exists:products,id',
            'cart.*.quantity' => 'required|integer|min:1',
        ]);

        try {

            $order = DB::transaction(function () use ($request) {

                // Calcular total real en el backend (por seguridad)
                $total = 0;
                $cartItems = $request->input('cart');

                // 1. Crear la cabecera de la venta
                $order = Order::create([
                    'client_id' => $request->client_id,
                    'user_id' => auth()->id(), // Usuario logueado
                    'total' => 0, // Lo actualizamos al final
                    'status' => 'paid'
                ]);

                // 2. Procesar cada item del carrito
                foreach ($cartItems as $item) {
                    $product = Product::find($item['id']);
                    
                    // Verificar stock una última vez
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stock insuficiente para: " . $product->name);
                    }

                    // Crear detalle
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'price' => $product->price
                    ]);

                    // Restar inventario
                    $product->decrement('stock', $item['quantity']);

                    // Sumar al total
                    $total += $product->price * $item['quantity'];
                }

                // 3. Actualizar total final
                $order->update(['total' => $total]);

                return $order;
            });

            //return redirect()->route('dashboard')->with('success', '¡Venta registrada con éxito!');
            return redirect()->route('pos.show', $order->id);

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error en la venta: ' . $e->getMessage()]);
        }
    }

    public function show(Order $order)
    {
        $order->load(['client', 'user', 'items.product']);

        return Inertia::render('POS/Show', [
            'order' => $order
        ]);
    }
}