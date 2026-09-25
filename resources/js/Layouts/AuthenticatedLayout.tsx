import { PropsWithChildren, ReactNode } from 'react';
import { usePage, Link } from '@inertiajs/react'; // Importante: usePage
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import Dropdown from '@/components/Dropdown'; // Mantenemos el dropdown original

export default function Authenticated({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    // Recuperamos el usuario autenticado como en el código original
    const user = usePage().props.auth.user;

    return (
        <SidebarProvider>
            {/* 1. La Barra Lateral Izquierda */}
            <AppSidebar />

            {/* 2. El Contenedor Principal (SidebarInset empuja el contenido cuando el menú se abre) */}
            <SidebarInset>
                {/* BARRA SUPERIOR (HEADER) */}
                <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-4">
                        {/* Botón hamburguesa para colapsar menú */}
                        <SidebarTrigger />
                        
                        {/* Aquí mostramos el Título de la página (ej: Dashboard) */}
                        {header && <div className="font-semibold text-gray-800 dark:text-gray-200">{header}</div>}
                    </div>

                    {/* DROPDOWN DE USUARIO (Original de Breeze) */}
                    <div className="flex items-center">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        {user.name}

                                        <svg
                                            className="-me-0.5 ms-2 h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </span>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* CONTENIDO PRINCIPAL DE LA PÁGINA */}
                <main className="flex-1 overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}