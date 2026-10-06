<?php

use App\Models\User;
use App\Models\Product;

test('Pagina de inventario es desplegada', function () {
    // 1. Creamos un usuario falso
    $user = User::factory()->create();

    // 2. Actuamos como ese usuario y entramos a /products
    $response = $this->actingAs($user)->get('/products');

    // 3. Verificamos que la página cargue bien (Status 200)
    $response->assertStatus(200);
});

test('Se pueden crear productos', function () {
    $user = User::factory()->create();

    // Enviamos datos para crear un producto
    $response = $this->actingAs($user)->post('/products', [
        'code' => 'TEST-001',
        'name' => 'Gafas de Prueba',
        'brand' => 'TestBrand',
        'price' => 100,
        'stock' => 10,
        'type' => 'frame',
    ]);

    // Verificamos que no hubo error y nos redirigió
    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Verificamos que se guardó en la base de datos
    $this->assertDatabaseHas('products', [
        'code' => 'TEST-001',
    ]);
});

test('No se pueden crear productos con precio o stock negativos', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/products', [
        'code' => 'TEST-NEG',
        'name' => 'Producto Inválido',
        'brand' => 'TestBrand',
        'price' => -100,
        'stock' => -5,
        'type' => 'frame',
    ]);

    $response->assertSessionHasErrors(['price', 'stock']);

    $this->assertDatabaseMissing('products', [
        'code' => 'TEST-NEG',
    ]);
});
