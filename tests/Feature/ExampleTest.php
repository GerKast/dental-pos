<?php

use App\Models\User;

it('redirige a los visitantes al login', function () {
    $response = $this->get('/');

    $response->assertRedirect(route('login'));
});

it('redirige a los usuarios autenticados al dashboard', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/');

    $response->assertRedirect(route('dashboard'));
});
