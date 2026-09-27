<?php

use App\Models\User;
use App\Models\Client;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use Inertia\Testing\AssertableInertia as Assert;

test('Pagina punto de venta es mostrado', function () {
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)->get('/pos');
    
    $response->assertStatus(200);
});

test('Transaccion de venta es procesada correctamente y redirije al Ticket', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create();
    
    // 1. Crear un producto
    $product = Product::factory()->create([
        'price' => 100,
        'stock' => 10
    ]);

    // 2. Simular carrito
    $cartPayload = [
        [
            'id' => $product->id,
            'quantity' => 2
        ]
    ];

    // 3. Enviar venta
    $response = $this->actingAs($user)->post('/pos', [
        'client_id' => $client->id,
        'cart' => $cartPayload
    ]);

    // 4. Verificaciones
    $response->assertSessionHasNoErrors();
    
    // --- CAMBIO AQUÍ: Verificamos que redirija a la nueva ruta de orders.show ---
    $order = Order::latest()->first();
    $response->assertRedirect(route('pos.show', $order));

    // Verificar base de datos
    $this->assertDatabaseHas('orders', [
        'client_id' => $client->id,
        'total' => '200.00', // Recordar: MySQL guarda como string decimal
    ]);

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'stock' => 8,
    ]);
});

test('Venta falla si no hay stock suficiente', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create();
    
    $product = Product::factory()->create(['stock' => 1]);

    $response = $this->actingAs($user)->post('/pos', [
        'client_id' => $client->id,
        'cart' => [[
            'id' => $product->id,
            'quantity' => 5
        ]]
    ]);

    $response->assertSessionHasErrors('error');
});

// --- NUEVO TEST: Verificación del Ticket ---
test('Pagina de ticket de venta es visible', function () {
    $user = User::factory()->create();
    
    // Crear una orden con items usando los Factories
    $order = Order::factory()->create([
        'user_id' => $user->id
    ]);
    
    // Crear 3 items para esa orden
    OrderItem::factory()->count(3)->create([
        'order_id' => $order->id
    ]);

    // Visitar la página del ticket
    $response = $this->actingAs($user)->get(route('pos.show', $order));

    $response->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('POS/Show')
            ->where('order.id', $order->id)
            ->has('order.items', 3) // Verificar que cargó los 3 items
            ->has('order.client')   // Verificar que cargó el cliente
        );
});

test('Venta falla si la cantidad de un producto es negativa', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create();

    $product = Product::factory()->create([
        'price' => 100,
        'stock' => 10,
    ]);

    $response = $this->actingAs($user)->post('/pos', [
        'client_id' => $client->id,
        'cart' => [[
            'id' => $product->id,
            'quantity' => -5,
        ]],
    ]);

    $response->assertSessionHasErrors('cart.0.quantity');

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'stock' => 10,
    ]);

    $this->assertDatabaseCount('orders', 0);
    $this->assertDatabaseCount('order_items', 0);
});

test('Venta falla si el producto no existe', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create();

    $response = $this->actingAs($user)->post('/pos', [
        'client_id' => $client->id,
        'cart' => [[
            'id' => 999999,
            'quantity' => 1,
        ]],
    ]);

    $response->assertSessionHasErrors('cart.0.id');

    $this->assertDatabaseCount('orders', 0);
    $this->assertDatabaseCount('order_items', 0);
});
