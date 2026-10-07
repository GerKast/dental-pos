import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Users, AlertTriangle, ShoppingBag } from "lucide-react";

// Tipos para TypeScript
type OrderStatus = 'pending' | 'paid' | 'delivered';

type RecentOrder = {
    id: number;
    status: OrderStatus;
    created_at: string;
    total: string;
    client: {
        name: string;
    };
};

type DashboardProps = {
    metrics: {
        total_sales: number;
        today_sales: number;
        total_clients: number;
        low_stock: number;
    };
    recent_orders: RecentOrder[];
};

const statusLabels: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    paid: 'Pagada',
    delivered: 'Entregada',
};

export default function Dashboard({ metrics, recent_orders }: DashboardProps) {
    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200">Panel de Control</h2>}>
            <Head title="Dashboard" />

            <div className="space-y-6">
                
                {/* 1. SECCIÓN DE TARJETAS (KPIs) */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    
                    {/* Tarjeta: Ventas Totales */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${metrics.total_sales.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Ingresos históricos</p>
                        </CardContent>
                    </Card>

                    {/* Tarjeta: Ventas Hoy */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">+${metrics.today_sales.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Ingresos del día</p>
                        </CardContent>
                    </Card>

                    {/* Tarjeta: Clientes */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.total_clients}</div>
                            <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
                        </CardContent>
                    </Card>

                    {/* Tarjeta: Alertas de Stock */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{metrics.low_stock}</div>
                            <p className="text-xs text-muted-foreground">Productos por agotarse</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 2. SECCIÓN DE TABLA (Últimas Ventas) */}
                <div className="grid gap-4 md:grid-cols-1">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Últimas Ventas Realizadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID Venta</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recent_orders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-gray-500">No hay ventas recientes</TableCell>
                                        </TableRow>
                                    ) : (
                                        recent_orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">#{order.id}</TableCell>
                                                <TableCell>{order.client.name}</TableCell>
                                                <TableCell>
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full uppercase font-bold">
                                                        {statusLabels[order.status]}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right font-bold">${parseFloat(order.total).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}