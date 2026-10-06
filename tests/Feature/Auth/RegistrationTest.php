<?php

test('El registro publico de usuarios no esta disponible', function () {
    $response = $this->get('/register');

    $response->assertNotFound();
});
