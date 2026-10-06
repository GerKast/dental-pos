import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Tipos de datos
type Product = { id: number; name: string; price: string; stock: number; code: string };
type CartItem = Product & { quantity: number };

export default function POSIndex({ products, clients }: { products: Product[], clients: any[] }) {
    // Estado del Carrito (Frontend)
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Formulario para enviar al backend
    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        cart: [] as any[],
        error: ''
    });

    // Filtro de productos (Buscador)
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Función: Agregar al Carrito
    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.id === product.id);
        
        if (existing) {
            // Si ya existe, aumentamos cantidad (sin pasar del stock)
            if (existing.quantity < product.stock) {
                setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
            } else {
                alert("¡No hay más stock disponible!");
            }
        } else {
            // Si no existe, lo agregamos con cantidad 1
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    // Función: Eliminar del Carrito
    const removeFromCart = (id: number) => {
        setCart(cart.filter(item => item.id !== id));
    };

    // Cálculo del Total
    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    // Función: Pagar (Enviar al backend)
    const handlePay = () => {
        if (!data.client_id) {
            alert("Por favor selecciona un cliente.");
            return;
        }
        // Actualizamos los datos del formulario con el carrito actual
        data.cart = cart; 
        // Enviamos
        post(route('pos.store'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200">Punto de Venta</h2>}>
            <Head title="POS" />

            <div className="py-6 h-[calc(100vh-80px)] flex flex-col md:flex-row gap-4 px-4">
                
                {/* COLUMNA IZQUIERDA: PRODUCTOS */}
                <div className="w-full md:w-2/3 flex flex-col gap-4">
                    <Input 
                        placeholder="Buscar producto por nombre o código..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-white"
                        autoFocus
                    />
                    
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
                        {filteredProducts.map(product => (
                            <Card key={product.id} 
                                  className="cursor-pointer hover:border-blue-500 transition-colors"
                                  onClick={() => addToCart(product)}>
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-gray-500">{product.code}</span>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 rounded">{product.stock} u.</span>
                                    </div>
                                    <CardTitle className="text-sm">{product.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-lg font-bold text-blue-600">${parseFloat(product.price).toLocaleString()}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* COLUMNA DERECHA: CARRITO Y PAGO */}
                <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">Ticket de Venta</h3>
                        
                        {/* Selector de Cliente */}
                        <div className="mb-4">
                            <label className="text-xs font-bold text-gray-500">Cliente</label>
                            <select 
                                className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                value={data.client_id}
                                onChange={e => setData('client_id', e.target.value)}
                            >
                                <option value="">-- Seleccionar Cliente --</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name} - {client.document}</option>
                                ))}
                            </select>
                            {errors.client_id && <p className="text-red-500 text-xs mt-1">{errors.client_id}</p>}
                        </div>

                        {/* Lista del Carrito */}
                        <div className="max-h-[40vh] overflow-y-auto">
                            <Table>
                                <TableBody>
                                    {cart.length === 0 ? (
                                        <TableRow><TableCell className="text-center text-gray-400 py-8">Carrito Vacío</TableCell></TableRow>
                                    ) : (
                                        cart.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell className="p-2">
                                                    <p className="text-sm font-medium">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.quantity} x ${parseFloat(item.price).toLocaleString()}</p>
                                                </TableCell>
                                                <TableCell className="text-right p-2 font-bold">
                                                    ${(item.quantity * parseFloat(item.price)).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="p-2 w-8">
                                                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">x</button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Total y Botón Pagar */}
                    <div className="border-t pt-4 mt-4">
                        {errors.error && (
                            <p className="mb-4 text-sm text-red-600">
                                {errors.error}
                            </p>
                        )}
                        <div className="flex justify-between items-center mb-4 text-xl font-bold">
                            <span>TOTAL:</span>
                            <span>${total.toLocaleString()}</span>
                        </div>
                        <Button 
                            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700" 
                            onClick={handlePay}
                            disabled={cart.length === 0 || processing}
                        >
                            {processing ? 'Procesando...' : '💰 PAGAR Y REGISTRAR'}
                        </Button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}