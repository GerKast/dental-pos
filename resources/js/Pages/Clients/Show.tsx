import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientShow({ client }: { client: any }) {
    // Formulario para la receta médica
    const { data, setData, post, processing, reset } = useForm({
        sphere_od: 0, cylinder_od: 0, axis_od: 0,
        sphere_oi: 0, cylinder_oi: 0, axis_oi: 0,
        addition: 0, observation: ''
    });

    const submitPrescription = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('clients.prescriptions.store', client.id), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200">Historia Clínica</h2>}>
            <Head title={`Historia - ${client.name}`} />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Columna Izquierda: Datos del Cliente */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Datos del Cliente</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div><Label className="text-xs text-gray-500">Nombre</Label><p className="font-medium">{client.name}</p></div>
                            <div><Label className="text-xs text-gray-500">Documento</Label><p>{client.document}</p></div>
                            <div><Label className="text-xs text-gray-500">Teléfono</Label><p>{client.phone}</p></div>
                            <div><Label className="text-xs text-gray-500">Email</Label><p>{client.email || 'N/A'}</p></div>
                        </CardContent>
                    </Card>

                    {/* Formulario Nueva Fórmula */}
                    <Card className="border-blue-200 shadow-md">
                        <CardHeader className="bg-blue-50 dark:bg-blue-900"><CardTitle className="text-blue-700 dark:text-blue-100">Nueva Fórmula</CardTitle></CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={submitPrescription} className="space-y-4">
                                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-gray-500">
                                    <span>Esfera</span><span>Cilindro</span><span>Eje</span>
                                </div>
                                
                                {/* Ojo Derecho */}
                                <p className="text-xs font-bold mt-2">Ojo Derecho (OD)</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <Input type="number" step="0.25" value={data.sphere_od} onChange={e => setData('sphere_od', parseFloat(e.target.value))} />
                                    <Input type="number" step="0.25" value={data.cylinder_od} onChange={e => setData('cylinder_od', parseFloat(e.target.value))} />
                                    <Input type="number" value={data.axis_od} onChange={e => setData('axis_od', parseFloat(e.target.value))} />
                                </div>

                                {/* Ojo Izquierdo */}
                                <p className="text-xs font-bold mt-2">Ojo Izquierdo (OI)</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <Input type="number" step="0.25" value={data.sphere_oi} onChange={e => setData('sphere_oi', parseFloat(e.target.value))} />
                                    <Input type="number" step="0.25" value={data.cylinder_oi} onChange={e => setData('cylinder_oi', parseFloat(e.target.value))} />
                                    <Input type="number" value={data.axis_oi} onChange={e => setData('axis_oi', parseFloat(e.target.value))} />
                                </div>

                                <div><Label>Adición</Label><Input type="number" step="0.25" value={data.addition} onChange={e => setData('addition', parseFloat(e.target.value))} /></div>
                                <div><Label>Observaciones</Label><Textarea value={data.observation} onChange={e => setData('observation', e.target.value)} /></div>
                                
                                <Button type="submit" className="w-full" disabled={processing}>Guardar Fórmula</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Columna Derecha: Historial de Recetas */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold">Historial de Fórmulas</h3>
                    {client.prescriptions.length === 0 ? (
                        <p className="text-gray-500">Este cliente no tiene fórmulas registradas.</p>
                    ) : (
                        client.prescriptions.map((prescription: any) => (
                            <Card key={prescription.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between">
                                        <CardTitle className="text-sm text-gray-500">Fecha: {new Date(prescription.created_at).toLocaleDateString()}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="font-bold text-sm border-b mb-2">Ojo Derecho</p>
                                            <p className="text-sm">ESF: {prescription.sphere_od} / CIL: {prescription.cylinder_od} / EJE: {prescription.axis_od}°</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm border-b mb-2">Ojo Izquierdo</p>
                                            <p className="text-sm">ESF: {prescription.sphere_oi} / CIL: {prescription.cylinder_oi} / EJE: {prescription.axis_oi}°</p>
                                        </div>
                                    </div>
                                    {prescription.addition > 0 && <p className="text-sm mt-2 text-blue-600">Adición: +{prescription.addition}</p>}
                                    {prescription.observation && <p className="text-sm mt-2 italic text-gray-600">"{prescription.observation}"</p>}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}