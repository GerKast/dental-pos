<?php

use App\Models\User;
use App\Models\Client;
use App\Models\Product;
use App\Models\Order;
use Inertia\Testing\AssertableInertia as Assert;

// 1. Verificar que la página carga
test('Pagina Dashboard es desplegada para usuarios autenticados', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertStatus(200)
        // Verificamos que se renderiza el componente correcto
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
        );
});

// 2. Verificar el cálculo de Métricas (KPIs)
test('Dashboard muestra metricas correctas', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create();

    // A. Preparamos el escenario (Arrange)
    // - Creamos 3 clientes
    Client::factory()->count(3)->create(); // Total clientes: 1 (arriba) + 3 = 4

    // - Creamos productos con stock bajo (para probar la alerta)
    Product::factory()->create(['stock' => 2]); // Bajo stock
    Product::factory()->create(['stock' => 3]); // Bajo stock
    Product::factory()->create(['stock' => 20]); // Stock normal
    // Total productos bajo stock (< 5) = 2

    // - Creamos ventas (Orders)
    // Venta 1: $100 (Hoy)
    Order::create([
        'client_id' => $client->id,
        'user_id' => $user->id,
        'total' => 100,
        'status' => 'paid',
        'created_at' => now()
    ]);

    // Venta 2: $50 (Ayer - Para probar que NO se suma en "Ventas Hoy")
    Order::create([
        'client_id' => $client->id,
        'user_id' => $user->id,
        'total' => 50,
        'status' => 'paid',
        'created_at' => now()->subDay()
    ]);

    // B. Ejecutamos la acción (Act)
    $response = $this->actingAs($user)->get('/dashboard');

    // C. Verificamos los datos (Assert)
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Dashboard')
        // Verificamos que la prop 'metrics' tenga los valores exactos
        ->where('metrics.total_sales', 150) 
        ->where('metrics.today_sales', 100)
        ->where('metrics.total_clients', 4) // El inicial + 3 creados
        ->where('metrics.low_stock', 2)     // Solo los 2 con stock < 5
    );
});

// 3. Verificar la tabla de Ventas Recientes
test('Dashboard enlista ordenes recientes correctamente', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create();

    // Creamos 10 órdenes antiguas
    Order::factory()->count(10)->create([
        'client_id' => $client->id,
        'user_id' => $user->id,
        'created_at' => now()->subDays(5)
    ]);

    // Creamos 1 orden MUY reciente (hace 1 minuto)
    $latestOrder = Order::create([
        'client_id' => $client->id,
        'user_id' => $user->id,
        'total' => 500,
        'status' => 'paid',
        'created_at' => now()
    ]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Dashboard')
        ->has('recent_orders', 5) // Debe traer solo 5, no las 11 totales
        ->where('recent_orders.0.total', 500)
        ->where('recent_orders.0.id', $latestOrder->id)
    );
});