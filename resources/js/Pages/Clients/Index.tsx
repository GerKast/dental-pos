import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react'; // Importamos Link
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from 'react';

export default function ClientsIndex({ clients }: { clients: any[] }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        document: '', name: '', email: '', phone: ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('clients.store'), {
            onSuccess: () => { setOpen(false); reset(); },
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200">Clientes</h2>}>
            <Head title="Clientes" />
            <div className="py-12"><div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Base de Datos de Clientes</h3>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild><Button>+ Nuevo Cliente</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Registrar Cliente</DialogTitle></DialogHeader>
                                <form onSubmit={submit} className="space-y-4 mt-4">
                                    <div><Label>Cédula / DNI</Label><Input value={data.document} onChange={e => setData('document', e.target.value)} required /></div>
                                    <div><Label>Nombre Completo</Label><Input value={data.name} onChange={e => setData('name', e.target.value)} required /></div>
                                    <div><Label>Teléfono</Label><Input value={data.phone} onChange={e => setData('phone', e.target.value)} required /></div>
                                    <div><Label>Email (Opcional)</Label><Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} /></div>
                                    <Button type="submit" className="w-full mt-4" disabled={processing}>Guardar</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Table>
                        <TableHeader><TableRow><TableHead>Documento</TableHead><TableHead>Nombre</TableHead><TableHead>Teléfono</TableHead><TableHead>Acción</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell>{client.document}</TableCell>
                                    <TableCell className="font-bold">{client.name}</TableCell>
                                    <TableCell>{client.phone}</TableCell>
                                    <TableCell>
                                        <Link href={route('clients.show', client.id)}>
                                            <Button variant="outline" size="sm">Ver Historial</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div></div>
        </AuthenticatedLayout>
    );
}